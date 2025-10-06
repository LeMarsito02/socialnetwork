import React, { useEffect, useState, useContext } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator, 
  Modal, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform 
} from "react-native";
import { Heart, MessageCircle, Send } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { supabase } from "../../utils/supabase";
import { AuthContext } from "@/contexts/AuthContext";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);

  // 🔹 Fetch posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          profiles (
            id, username, avatar_url
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch comments de un post
  const fetchComments = async (postId) => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          *,
          profiles (id, username, avatar_url)
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setComments(data);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLike = async (postId) => {
    if (!user) return;
    try {
      // Evitar duplicados
      const existingLike = await supabase
        .from("post_likes")
        .select("*")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .single();

      if (!existingLike.data) {
        await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, likes_count: (p.likes_count || 0) + 1, liked_by_user: true } : p
          )
        );
      }
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleOpenComments = async (postId) => {
    setSelectedPostId(postId);
    await fetchComments(postId);
    setCommentsModalVisible(true);
  };

  const handleAddComment = async () => {
    if (!user || !commentText.trim()) return;

    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          post_id: selectedPostId,
          user_id: user.id,
          content: commentText.trim(),
        })
        .select("*")
        .single();

      if (error) throw error;

      setComments((prev) => [...prev, { ...data, profiles: { username: user.username, avatar_url: user.avatar_url } }]);
      setCommentText("");
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const renderPost = ({ item, index }) => {
    const isTextOnly = !item.media_url; // Diferenciar posts solo texto

    return (
      <MotiView
        from={{ opacity: 0, translateY: 40 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: index * 100, type: "timing" }}
        style={[styles.postCard, isTextOnly && styles.textOnlyPost]}
      >
        <View style={styles.postHeader}>
          <Image source={{ uri: item.profiles.avatar_url }} style={styles.avatar} />
          <Text style={styles.username}>{item.profiles.username}</Text>
        </View>

        {item.media_url && <Image source={{ uri: item.media_url }} style={styles.postImage} />}

        <View style={styles.actions}>
          <TouchableOpacity onPress={() => handleLike(item.id)} activeOpacity={0.7}>
            <Heart size={22} color={item.liked_by_user ? "#e63946" : "#000"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleOpenComments(item.id)} activeOpacity={0.7} style={{ marginLeft: 14 }}>
            <MessageCircle size={22} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} style={{ marginLeft: 14 }}>
            <Send size={22} color="#000" />
          </TouchableOpacity>
        </View>

        <Text style={styles.caption}>
          <Text style={styles.username}>{item.profiles.username} </Text>
          {item.caption}
        </Text>

        <Text style={[styles.caption, { fontWeight: "600" }]}>
          {item.likes_count || 0} me gusta
        </Text>
      </MotiView>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#0554F2" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>StudentHub</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity activeOpacity={0.7}>
            <Heart size={24} color="#000" style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/chat")} activeOpacity={0.7}>
            <Send size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* Modal Comentarios */}
      <Modal visible={commentsModalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FlatList
              data={comments}
              keyExtractor={(c) => c.id}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <Image source={{ uri: item.profiles.avatar_url }} style={styles.commentAvatar} />
                  <Text>
                    <Text style={{ fontWeight: "bold" }}>{item.profiles.username} </Text>
                    {item.content}
                  </Text>
                </View>
              )}
            />
            <View style={styles.commentInputContainer}>
              <TextInput
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Agrega un comentario..."
                style={styles.commentInput}
              />
              <TouchableOpacity onPress={handleAddComment} style={{ marginLeft: 8 }}>
                <Send size={22} color="#0554F2" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.closeModal} onPress={() => setCommentsModalVisible(false)}>
              <Text style={{ color: "#0554F2", fontWeight: "600" }}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6fa" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  logo: { fontSize: 22, fontWeight: "bold", color: "#0554F2" },
  headerIcons: { flexDirection: "row" },
  icon: { marginRight: 18 },
  postCard: {
    backgroundColor: "#fff",
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  textOnlyPost: {
    backgroundColor: "#e0f7fa",
    paddingVertical: 20,
    paddingHorizontal: 14,
  },
  postHeader: { flexDirection: "row", alignItems: "center", padding: 12 },
  avatar: { width: 38, height: 38, borderRadius: 19, marginRight: 10 },
  username: { fontWeight: "bold", fontSize: 14, color: "#111" },
  postImage: { width: "100%", height: 360, resizeMode: "cover" },
  actions: { flexDirection: "row", paddingHorizontal: 12, paddingVertical: 10 },
  caption: { paddingHorizontal: 12, paddingBottom: 14, fontSize: 14, color: "#333", lineHeight: 20 },

  modalContainer: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: {
    backgroundColor: "#fff",
    maxHeight: "70%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 12,
  },
  commentItem: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  commentAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },
  commentInputContainer: { flexDirection: "row", alignItems: "center", borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 8 },
  commentInput: { flex: 1, height: 40, borderWidth: 1, borderColor: "#ccc", borderRadius: 20, paddingHorizontal: 12 },
  closeModal: { marginTop: 12, alignItems: "center" },
});
