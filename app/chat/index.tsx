// app/chat/index.tsx
import { AuthContext } from "@/contexts/AuthContext";
import { useMessages } from "@/contexts/MessageContext";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import { ArrowLeft, Search } from "lucide-react-native";
import { useContext, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ---------------------------
   Tipos
--------------------------- */
type Participant = {
  id: string;
  username: string | null;
  avatar_url: string | null;
};

type LastMessage = {
  message: string | null;
  created_at: string;
};

type ChatItem = {
  id: string;
  participants: Participant[];
  last_message?: LastMessage | null;
};

/* ---------------------------
   Mock data (Notas estilo Instagram)
--------------------------- */
const mockNotes = [
  { id: "1", username: "Your note", avatar_url: "https://i.pravatar.cc/150?u=you", text: "📍 Location off" },
  { id: "2", username: "Fernanda", avatar_url: "https://i.pravatar.cc/150?u=fer", text: "Qué risa los videos de anoche JAJAJ" },
  { id: "3", username: "Hellen", avatar_url: "https://i.pravatar.cc/150?u=hellen", text: "Llévenme al SOFA 😭" },
  { id: "4", username: "Vilo", avatar_url: "https://i.pravatar.cc/150?u=vilo", text: "Lemar brooo 😎" },
];

/* ---------------------------
   Helper para avatar placeholder
--------------------------- */
const placeholderFor = (username?: string | null, id?: string | null, size = 128) => {
  if (username && username.trim().length > 0) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=ffffff&rounded=true&size=${size}`;
  }
  return `https://i.pravatar.cc/150?u=${encodeURIComponent(id || "unknown")}`;
};

function Avatar({
  uri,
  username,
  id,
  size = 52,
  style,
}: {
  uri?: string | null;
  username?: string | null;
  id?: string | null;
  size?: number;
  style?: any;
}) {
  const [source, setSource] = useState<{ uri: string }>({
    uri: uri || placeholderFor(username, id, size * 2),
  });

  useEffect(() => {
    setSource({ uri: uri || placeholderFor(username, id, size * 2) });
  }, [uri, username, id, size]);

  const onError = () => setSource({ uri: placeholderFor(username, id, size * 2) });

  return (
    <Image
      source={{ uri: source.uri }}
      onError={onError}
      style={[{ width: size, height: size, borderRadius: size / 2 }, style]}
    />
  );
}

/* ---------------------------
   Pantalla principal
--------------------------- */
export default function MessagesScreen() {
  const [search, setSearch] = useState("");
  const [recommended, setRecommended] = useState<Participant[]>([]);
  const [profiles, setProfiles] = useState<Participant[]>([]);
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { chats, fetchChats, createChat } = useMessages();

  useEffect(() => {
    if (!user) return;
    fetchChats();
    fetchRecommended();
  }, [user]);

  const fetchRecommended = async () => {
    if (!user) return;
    try {
      const chatParticipants = chats.flatMap((c: ChatItem) =>
        c.participants.map((p) => p.id)
      );
      const excludeIds = [...chatParticipants, user.id];

      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .not("id", "in", `(${excludeIds.join(",")})`)
        .limit(10);

      if (error) throw error;
      setRecommended(data || []);
    } catch (err) {
      console.error("Error fetchRecommended:", err);
    }
  };

  const handleSearch = async (text: string) => {
    setSearch(text);
    if (!text.trim()) {
      setProfiles([]);
      return;
    }

    try {
      const chatParticipants = chats.flatMap((c: ChatItem) =>
        c.participants.map((p) => p.id)
      );
      const excludeIds = [...chatParticipants, user?.id];

      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .ilike("username", `%${text}%`)
        .not("id", "in", `(${excludeIds.join(",")})`)
        .limit(20);

      if (error) throw error;
      setProfiles(data || []);
    } catch (err) {
      console.error("❌ Error searchProfiles:", err);
    }
  };

  const handleOpenChat = async (otherUserId: string) => {
    if (!user) return;
    const newChat = await createChat(otherUserId);
    if (newChat) router.push(`/chat/${newChat.id}`);
  };

  const renderChatItem = ({ item }: { item: ChatItem }) => {
    const others = item.participants.filter((p) => p.id !== user?.id);
    const primary = others[0] ?? item.participants[0];
    const displayName = primary?.username || "Usuario";
    const displayAvatarUri = primary?.avatar_url ?? null;
    const lastMessage = item.last_message;

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => router.push(`/chat/${item.id}`)}
      >
        <Avatar uri={displayAvatarUri} username={primary?.username} id={primary?.id} size={52} style={{ marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.username} numberOfLines={1}>{displayName}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {lastMessage?.message || "Sin mensajes"}
          </Text>
        </View>
        <Text style={styles.time}>
          {lastMessage
            ? new Date(lastMessage.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderUserItem = ({ item }: { item: Participant }) => (
    <TouchableOpacity
      style={styles.suggestedItem}
      onPress={() => handleOpenChat(item.id)}
    >
      <Avatar uri={item.avatar_url} username={item.username} id={item.id} size={46} style={{ marginRight: 10 }} />
      <Text style={styles.suggestedName}>{item.username}</Text>
    </TouchableOpacity>
  );

  const usersToShow = search.trim() ? profiles : recommended;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <ArrowLeft size={24} color="#0554F2" />
          </TouchableOpacity>
          <Text style={styles.title}>{user?.username || "No se pudo cargar :c"}</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <Text style={styles.dot}>●</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Search size={18} color="#888" style={{ marginRight: 6 }} />
          <TextInput
            placeholder="Buscar usuarios..."
            placeholderTextColor="#888"
            style={styles.searchInput}
            value={search}
            onChangeText={handleSearch}
          />
        </View>

        {/* Contenido principal */}
        {search.trim() ? (
          <FlatList
            data={usersToShow}
            keyExtractor={(item) => item.id}
            renderItem={renderUserItem}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <Text style={styles.noChats}>No se encontraron usuarios 😢</Text>
            }
            contentContainerStyle={{ paddingBottom: 30 }}
          />
        ) : (
          <FlatList
            data={chats}
            keyExtractor={(item) => item.id}
            renderItem={renderChatItem}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <Text style={styles.noChats}>No tienes mensajes todavía 📭</Text>
            }
            ListHeaderComponent={
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.notesContainer}
              >
                {mockNotes.map((note) => (
                  <View key={note.id} style={styles.noteItem}>
                    <Avatar
                      uri={note.avatar_url}
                      username={note.username}
                      size={50}
                    />
                    <View style={styles.noteBubble}>
                      <Text style={styles.noteText} numberOfLines={3}>
                        {note.text}
                      </Text>
                    </View>
                    <Text style={styles.noteUsername} numberOfLines={1}>
                      {note.username}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            }
            contentContainerStyle={{ paddingBottom: 30 }}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

}

/* ---------------------------
   Estilos
--------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 12 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  iconBtn: { padding: 6 },
  title: { fontSize: 20, fontWeight: "700", color: "#111" },
  dot: { fontSize: 22, color: "#0554F2" },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  searchInput: { flex: 1, fontSize: 15, color: "#111" },

  // 💬 Chats
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  username: { fontWeight: "600", fontSize: 16, color: "#111" },
  lastMessage: { fontSize: 13, color: "#666", marginTop: 1 },
  time: { fontSize: 12, color: "#999", marginLeft: 8 },
  separator: { height: 0.5, backgroundColor: "#eee" },

  // 🧍Usuarios sugeridos
  suggestedItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  suggestedName: { fontSize: 15, fontWeight: "500", color: "#333" },

  // 🗯️ Notas (stories)
  notesContainer: {
    flexDirection: "row",
    paddingVertical: 6,
    marginBottom: 8,
  },
  noteItem: { alignItems: "center", width: 74, marginRight: 10 },
  noteText: { fontSize: 11, color: "#333", textAlign: "center" },
  noteBubble: {
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    paddingHorizontal: 5,
    paddingVertical: 3,
    marginTop: 3,
    maxWidth: 68,
  },
  noteUsername: {
    fontSize: 11,
    color: "#555",
    marginTop: 2,
    textAlign: "center",
    maxWidth: 68,
  },

  // 🔸 Mensajes vacíos
  noChats: {
    textAlign: "center",
    marginVertical: 20,
    color: "#666",
    fontSize: 14,
  },
});
