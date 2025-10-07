// app/chat/[id].tsx
import { AuthContext } from "@/contexts/AuthContext";
import { useMessages } from "@/contexts/MessageContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Send, Paperclip } from "lucide-react-native";
import { useContext, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/utils/supabase";
import { Video, ResizeMode } from "expo-av";

export default function ChatDetailScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const chatId = Array.isArray(rawId) ? rawId[0] : rawId;

  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { messages, fetchMessages, sendMessage, chats } = useMessages();

  const [chatInfo, setChatInfo] = useState<{ displayName: string; avatar: string | null } | null>(
    null
  );
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const placeholderFor = (username?: string | null, id?: string | null, size = 128) => {
    if (username && username.trim().length > 0) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        username
      )}&background=random&color=ffffff&rounded=true&size=${size}`;
    }
    return `https://i.pravatar.cc/150?u=${encodeURIComponent(id || "unknown")}`;
  };

  useEffect(() => {
    if (!chatId || !user) return;
    fetchMessages(chatId);
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      const others = chat.participants.filter((p) => p.id !== user.id);
      const displayName =
        others.length > 1
          ? others.map((o) => o.username || "Usuario").join(", ")
          : others[0]?.username || "Usuario";
      setChatInfo({
        displayName,
        avatar:
          others[0]?.avatar_url ?? placeholderFor(others[0]?.username, others[0]?.id),
      });
    }
  }, [chatId, user, chats]);

  // 📤 Enviar texto
  const handleSend = async () => {
    if (!chatId || !input.trim() || sending) return;
    setSending(true);
    await sendMessage(chatId, input.trim());
    setInput("");
    setSending(false);
    scrollToEnd();
  };

  // 📎 Adjuntar archivo
  const handleAttachment = async () => {
    if (!chatId || !user) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      const fileUri = asset?.uri;
      const fileName = asset?.name || `archivo_${Date.now()}`;

      if (!fileUri) throw new Error("No se pudo obtener el URI del archivo");

      setSending(true);

      // Determinar tipo de media por extensión
      let mediaType: "image" | "video" | "audio" | "file" = "file";
      const extension = fileName.split(".").pop()?.toLowerCase();
      if (extension) {
        if (["png", "jpg", "jpeg", "gif", "webp"].includes(extension)) mediaType = "image";
        else if (["mp4", "mov", "mkv"].includes(extension)) mediaType = "video";
        else if (["mp3", "wav", "ogg"].includes(extension)) mediaType = "audio";
      }

      // Convertir URI a formato compatible con Supabase
      const response = await fetch(fileUri);
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Uint8Array(arrayBuffer);

      const filePath = `${user.id}/${Date.now()}_${fileName}`;

      // Subir archivo a Supabase
      const { error: uploadError } = await supabase.storage
        .from("chat_media")
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data } = supabase.storage.from("chat_media").getPublicUrl(filePath);
      const mediaUrl = data?.publicUrl;
      if (!mediaUrl) throw new Error("No se pudo obtener la URL pública");

      // Enviar mensaje con archivo adjunto
      await sendMessage(chatId, undefined, mediaType, mediaUrl);

      scrollToEnd();
    } catch (error) {
      console.error("❌ Error al subir archivo:", error);
    } finally {
      setSending(false);
    }
  };

  const scrollToEnd = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 🔹 Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#0554F2" />
        </TouchableOpacity>

        {chatInfo ? (
          <View style={styles.userInfo}>
            {chatInfo.avatar ? (
              <Image source={{ uri: chatInfo.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: "#ddd" }]} />
            )}
            <Text style={styles.title} numberOfLines={1}>
              {chatInfo.displayName}
            </Text>
          </View>
        ) : (
          <Text style={styles.title}>Cargando...</Text>
        )}

        <View style={{ width: 30 }} />
      </View>

      {/* 🔹 Lista de mensajes */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isMine = item.sender_id === user?.id;
          const isPending = item.id.startsWith("temp-");

          return (
            <View
              style={[
                styles.messageBubble,
                isMine ? styles.myMessage : styles.theirMessage,
                isPending && { opacity: 0.6 },
              ]}
            >
              {/* Imagen */}
              {item.media_type === "image" && item.media_url ? (
                <Image source={{ uri: item.media_url }} style={styles.image} />
              ) : 
              /* Video */
              item.media_type === "video" && item.media_url ? (
                <Video
                  source={{ uri: item.media_url }}
                  style={styles.image}
                  useNativeControls
                  resizeMode={ResizeMode.COVER}
                />
              ) : 
              /* Audio o documento */
              item.media_type && item.media_url ? (
                <Text style={{ color: isMine ? "#fff" : "#333" }}>
                  📎 {item.media_type.toUpperCase()} - {item.message || "Archivo adjunto"}
                </Text>
              ) : (
                <Text style={[styles.messageText, isMine && { color: "#fff" }]}>
                  {item.message}
                </Text>
              )}

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {isPending && <ActivityIndicator size="small" color="#ccc" />}
                <Text style={[styles.messageTime, isMine && { color: "#eee" }]}>
                  {new Date(item.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </View>
          );
        }}
        contentContainerStyle={{ padding: 16 }}
        onContentSizeChange={scrollToEnd}
      />

      {/* 🔹 Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={styles.inputBar}>
          <TouchableOpacity onPress={handleAttachment} style={styles.attachBtn}>
            <Paperclip size={22} color="#0554F2" />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Escribe un mensaje..."
            placeholderTextColor="#777"
            value={input}
            onChangeText={setInput}
            multiline
          />

          <TouchableOpacity
            onPress={handleSend}
            style={[styles.sendBtn, sending && { opacity: 0.5 }]}
            disabled={sending}
          >
            <Send size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
    justifyContent: "space-between",
  },
  backBtn: { padding: 6 },
  userInfo: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  title: { fontSize: 16, fontWeight: "bold", flexShrink: 1 },
  messageBubble: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 14,
    marginBottom: 10,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#0554F2",
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f1f1",
  },
  messageText: { fontSize: 15 },
  messageTime: { fontSize: 11, marginTop: 4, textAlign: "right" },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 4,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 0.5,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
  },
  attachBtn: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: "#0554F2",
    padding: 10,
    borderRadius: 20,
  },
});