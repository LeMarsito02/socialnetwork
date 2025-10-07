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
  Platform,
} from "react-native";
import { Heart, MessageCircle, Send } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MotiView, AnimatePresence } from "moti";
import LottieView from "lottie-react-native";
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
  const [likeAnimation, setLikeAnimation] = useState(null);
  const [loadingComments, setLoadingComments] = useState(false);

  // 🔹 Cargar posts con información del perfil y likes
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          profiles (
            id, username, avatar_url
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      let processedPosts = data.map((p) => {
        const username = p.profiles?.username || "User";
        const avatar_url =
          p.profiles?.avatar_url ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=ffffff&rounded=true&size=128`;

        return {
          ...p,
          profiles: { ...p.profiles, avatar_url },
        };
      });

      if (user) {
        const { data: likesData } = await supabase
          .from("post_likes")
          .select("post_id")
          .eq("user_id", user.id);

        const likedPostIds = likesData?.map((l) => l.post_id) || [];
        processedPosts = processedPosts.map((p) => ({
          ...p,
          liked_by_user: likedPostIds.includes(p.id),
        }));
      }

      setPosts(processedPosts);
    } catch (err) {
      console.error("❌ Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Obtener comentarios del post seleccionado
  const fetchComments = async (postId) => {
    try {
      setLoadingComments(true);
      const { data, error } = await supabase
        .from("post_comments")
        .select(
          `
          id,
          content,
          created_at,
          profiles (
            id, username, avatar_url
          )
        `
        )
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const processed = data.map((c) => {
        const username = c.profiles?.username || "User";
        const avatar_url =
          c.profiles?.avatar_url ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=ffffff&rounded=true&size=128`;
        return { ...c, profiles: { ...c.profiles, avatar_url } };
      });

      setComments(processed);
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // ❤️ Like / Dislike con animación
  const handleLike = async (postId, liked) => {
    if (!user) return;
    try {
      if (liked) {
        await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);

        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  likes_count: (p.likes_count || 1) - 1,
                  liked_by_user: false,
                }
              : p
          )
        );
      } else {
        await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  likes_count: (p.likes_count || 0) + 1,
                  liked_by_user: true,
                }
              : p
          )
        );
        setLikeAnimation(postId);
        setTimeout(() => setLikeAnimation(null), 1200);
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
        .from("post_comments")
        .insert({
          post_id: selectedPostId,
          user_id: user.id,
          content: commentText.trim(),
        })
        .select(
          `
          id,
          content,
          created_at,
          profiles (
            id, username, avatar_url
          )
        `
        )
        .single();

      if (error) throw error;

      const username = data.profiles?.username || user.username || "User";
      const avatar_url =
        data.profiles?.avatar_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=ffffff&rounded=true&size=128`;

      const newComment = { ...data, profiles: { username, avatar_url } };
      setComments((prev) => [...prev, newComment]);
      setCommentText("");

      setPosts((prev) =>
        prev.map((p) =>
          p.id === selectedPostId
            ? { ...p, comments_count: (p.comments_count || 0) + 1 }
            : p
        )
      );
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const renderPost = ({ item, index }) => {
    const isTextOnly = !item.media_url;

    return (
      <MotiView
        from={{ opacity: 0, translateY: 40 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: index * 100, type: "timing" }}
        style={[styles.postCard, isTextOnly && styles.textOnlyPost]}
      >
        <View style={styles.postHeader}>
          <Image source={{ uri: item.profiles.avatar_url }} style={styles.avatar} />
          <View>
            <Text style={styles.username}>{item.profiles.username}</Text>
            <Text style={styles.timeText}>@{item.profiles.username.toLowerCase()}</Text>
          </View>
        </View>

        {item.media_url ? (
          <Image source={{ uri: item.media_url }} style={styles.postImage} />
        ) : (
          <Text style={styles.textPostContent}>{item.caption}</Text>
        )}

        <AnimatePresence>
          {likeAnimation === item.id && (
            <MotiView
              from={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              style={styles.likeAnimationContainer}
            >
              <LottieView
                source={require("../../assets/animations/heart.json")}
                autoPlay
                loop={false}
                style={{ width: 150, height: 150 }}
              />
            </MotiView>
          )}
        </AnimatePresence>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={() => handleLike(item.id, item.liked_by_user)}
            activeOpacity={0.7}
            style={styles.actionBtn}
          >
            <Heart
              size={22}
              color={item.liked_by_user ? "#e63946" : "#555"}
              fill={item.liked_by_user ? "#e63946" : "transparent"}
            />
            <Text style={styles.actionText}>{item.likes_count || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleOpenComments(item.id)}
            activeOpacity={0.7}
            style={styles.actionBtn}
          >
            <MessageCircle size={20} color="#555" />
            <Text style={styles.actionText}>{item.comments_count || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} style={styles.actionBtn}>
            <Send size={20} color="#555" />
          </TouchableOpacity>
        </View>
      </MotiView>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <LottieView
          source={require("../../assets/animations/loading.json")}
          autoPlay
          loop
          style={{ width: 180, height: 180 }}
        />
        <Text style={{ marginTop: 12, color: "#0554F2", fontWeight: "600" }}>
          Cargando publicaciones...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 🔹 Header */}
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

      {/* 🔹 Feed con “pull to refresh” */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshing={loading} // ✅ Spinner de recarga
        onRefresh={fetchPosts} // ✅ Refrescar posts al deslizar
      />

      {/* 🔹 Modal de comentarios */}
      <Modal visible={commentsModalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <FlatList
              data={comments}
              keyExtractor={(c) => c.id}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <Image
                    source={{ uri: item.profiles.avatar_url }}
                    style={styles.commentAvatar}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "bold", color: "#111" }}>
                      {item.profiles.username}
                    </Text>
                    <Text style={{ color: "#333" }}>{item.content}</Text>
                  </View>
                </View>
              )}
              refreshing={loadingComments} // ✅ Spinner de comentarios
              onRefresh={() => fetchComments(selectedPostId)} // ✅ Refrescar comentarios
              ListEmptyComponent={
                <Text style={{ textAlign: "center", color: "#888", marginTop: 20 }}>
                  No hay comentarios aún. ¡Sé el primero!
                </Text>
              }
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

            <TouchableOpacity
              style={styles.closeModal}
              onPress={() => setCommentsModalVisible(false)}
            >
              <Text style={{ color: "#0554F2", fontWeight: "600" }}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  likeAnimationContainer: {
    position: "absolute",
    top: "35%",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  logo: { fontSize: 22, fontWeight: "bold", color: "#0554F2" },
  headerIcons: { flexDirection: "row" },
  icon: { marginRight: 18 },
  postCard: {
    backgroundColor: "#fff",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textOnlyPost: { backgroundColor: "#fff" },
  postHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  username: { fontWeight: "700", fontSize: 14, color: "#111" },
  timeText: { fontSize: 12, color: "#666" },
  postImage: { width: "100%", height: 300, borderRadius: 10, marginTop: 8 },
  textPostContent: { fontSize: 16, color: "#111", lineHeight: 22, marginVertical: 6 },
  actionsRow: { flexDirection: "row", alignItems: "center", marginTop: 8, paddingVertical: 4 },
  actionBtn: { flexDirection: "row", alignItems: "center", marginRight: 18 },
  actionText: { marginLeft: 4, fontSize: 13, color: "#555" },
  modalContainer: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  modalContent: {
    backgroundColor: "#fff",
    maxHeight: "75%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 14,
  },
  commentItem: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  commentAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
  },
  commentInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 12,
    backgroundColor: "#f9fafb",
  },
  closeModal: { marginTop: 12, alignItems: "center" },
});
