// context/MessageContext.tsx
import { AuthContext } from "@/contexts/AuthContext";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

// Tipos
interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  message: string | null;
  media_type: "image" | "audio" | "video" | "file" | null;
  media_url: string | null;
  created_at: string;
}

interface Chat {
  id: string;
  created_at: string;
  participants: { id: string; username: string; avatar_url: string | null }[];
  last_message?: Message | null;
}

interface MessageContextProps {
  chats: Chat[];
  messages: Message[];
  loading: boolean;
  fetchChats: () => Promise<void>;
  fetchMessages: (chatId: string) => Promise<Message[]>;
  sendMessage: (
    chatId: string,
    message?: string,
    mediaType?: Message["media_type"],
    mediaUrl?: string
  ) => Promise<boolean>;
  createChat: (participantId: string) => Promise<Chat | null>;
}

const MessageContext = createContext<MessageContextProps | undefined>(undefined);

export const MessageProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useContext(AuthContext);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // 🔹 Obtener todos los chats del usuario
const fetchChats = async () => {
  if (!user) return;

  const { data, error } = await supabase
    .from("chat_participants")
    .select(`
      chat_id,
      chats (
        id,
        created_at,
        messages (
          id,
          chat_id,
          sender_id,
          message,
          media_type,
          media_url,
          created_at
        ),
        chat_participants (
          user_id,
          profiles (
            id,
            username,
            avatar_url
          )
        )
      )
    `)
    .eq("user_id", user.id);

  if (error) {
    console.error("❌ Error al obtener chats:", error);
    return;
  }

  // 🔹 Transformar el resultado en un formato limpio y tipado
  const formattedChats: Chat[] = data.map((entry: any) => {
    const chat = entry.chats;

    // Ordenar mensajes por fecha y obtener el más reciente
    const lastMessage =
      chat.messages && chat.messages.length > 0
        ? [...chat.messages].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0]
        : null;

    return {
      id: chat.id,
      created_at: chat.created_at,
      participants:
        chat.chat_participants?.map((cp: any) => ({
          id: cp.profiles?.id ?? "",
          username: cp.profiles?.username ?? "Usuario desconocido",
          avatar_url: cp.profiles?.avatar_url ?? null,
        })) || [],
      last_message: lastMessage,
    };
  });

  setChats(formattedChats);
};


  // 🔹 Obtener mensajes de un chat específico
  const fetchMessages = async (chatId: string): Promise<Message[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("id, chat_id, sender_id, message, media_type, media_url, created_at")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      setActiveChatId(chatId);
      return data || [];
    } catch (err) {
      console.error("❌ Error obteniendo mensajes:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Realtime para mensajes SOLO del chat activo
  useEffect(() => {
    if (!user || !activeChatId) return;

    const channel = supabase
      .channel(`chat-${activeChatId}-realtime`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMessage = payload.new as Message;
          if (newMessage.chat_id === activeChatId) {
            setMessages((prev) => [...prev, newMessage]);
            fetchChats();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeChatId]);

  // 🔹 Realtime para chats (nuevos chats o cambios en participantes)
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("chats-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_participants" },
        () => {
          fetchChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // 🔹 Crear un chat si no existe
  const createChat = async (participantId: string): Promise<Chat | null> => {
    if (!user) return null;

    try {
      // Buscar chats existentes
      const { data: existing, error: existingError } = await supabase
        .from("chats")
        .select(`
          id,
          created_at,
          chat_participants (
            user_id,
            profiles ( id, username, avatar_url )
          )
        `);

      if (existingError) throw existingError;

      // Verificamos si ya hay un chat 1 a 1 entre ambos
      const chatFound = existing?.find(
        (c: any) =>
          c.chat_participants.some((p: any) => p.user_id === user.id) &&
          c.chat_participants.some((p: any) => p.user_id === participantId)
      );

      if (chatFound) {
        return {
          id: chatFound.id,
          created_at: chatFound.created_at,
          participants: chatFound.chat_participants.map((p: any) => ({
            id: p.profiles.id ?? "",
            username: p.profiles.username ?? "",
            avatar_url: p.profiles.avatar_url ?? null,
          })),
          last_message: null,
        };
      }

      // Crear nuevo chat
      const { data: chat, error: chatError } = await supabase
        .from("chats")
        .insert({})
        .select()
        .single();

      if (chatError) throw chatError;

      // Agregar participantes
      await supabase.from("chat_participants").insert([
        { chat_id: chat.id, user_id: user.id },
        { chat_id: chat.id, user_id: participantId },
      ]);

      await fetchChats();

      return {
        id: chat.id,
        created_at: chat.created_at,
        participants: [
          { id: String(user.id), username: "", avatar_url: null },
          { id: participantId, username: "", avatar_url: null },
        ],
        last_message: null,
      };
    } catch (err) {
      console.error("❌ Error creando chat:", err);
      return null;
    }
  };

  // 🔹 Enviar un mensaje (texto o media)
// 🔹 Enviar un mensaje (texto o media)
const sendMessage = async (
  chatId: string,
  message?: string,
  mediaType?: Message["media_type"],
  mediaUrl?: string
) => {
  if (!user?.id) return false;

  // 👇 Crear mensaje temporal
  const tempMessage: Message = {
    id: `temp-${Date.now()}`,
    chat_id: chatId,
    sender_id: user.id,
    message: message ?? null,
    media_type: mediaType ?? null,
    media_url: mediaUrl ?? null,
    created_at: new Date().toISOString(),
  };

  // 👇 Mostrarlo de inmediato en la interfaz
  setMessages((prev) => [...prev, tempMessage]);

  try {
    const { data, error } = await supabase
      .from("messages")
      .insert({
        chat_id: chatId,
        sender_id: user.id,
        message: message ?? null,
        media_type: mediaType ?? null,
        media_url: mediaUrl ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    // 👇 Reemplazamos el temporal por el real (el que devuelve Supabase)
    setMessages((prev) =>
      prev.map((m) => (m.id === tempMessage.id ? data : m))
    );

    // 👇 Actualizamos lista de chats (para actualizar el "último mensaje")
    fetchChats();

    return true;
  } catch (err) {
    console.error("❌ Error enviando mensaje:", err);

    // 👇 En caso de error, quitamos el mensaje temporal
    setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
    return false;
  }
};


  return (
    <MessageContext.Provider
      value={{
        chats,
        messages,
        loading,
        fetchChats,
        fetchMessages,
        sendMessage,
        createChat,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (!context) throw new Error("useMessages debe usarse dentro de MessageProvider");
  return context;
};
