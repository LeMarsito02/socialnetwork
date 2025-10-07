// HomeScreen.jsx
import React, { useContext, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heart, MessageCircle, Send, X } from "lucide-react-native";
import { useRouter } from "expo-router";
import { MotiView, AnimatePresence } from "moti";
import LottieView from "lottie-react-native";
import { PostContext } from "@/contexts/PostContext";

export default function HomeScreen() {
  const router = useRouter();
  const {
    posts,
    loading,
    comments,
    loadingComments,
    likeAnimation,
    fetchPosts,
    fetchComments,
    handleLike,
    handleAddComment,
  } = useContext(PostContext);

  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [commentText, setCommentText] = useState("");

  const handleOpenComments = async (postId) => {
    setSelectedPostId(postId);
    await fetchComments(postId);
    setCommentsModalVisible(true);
  };

  const handleCloseComments = () => {
    setCommentsModalVisible(false);
    setCommentText("");
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
        <Text style={styles.loadingText}>Cargando publicaciones...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Nav Bar */}
      <View style={styles.navBar}>
        <Text accessibilityRole="header" style={styles.navTitle}>
          Inicio
        </Text>
        <TouchableOpacity
          accessibilityLabel="Ir a mensajería"
          accessibilityHint="Abre la pantalla de chat"
          onPress={() => router.push("/chat")}
          style={styles.navButton}
        >
          <MessageCircle size={22} color="#0554F2" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        onRefresh={fetchPosts}
        refreshing={loading}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item, index }) => (
          <MotiView
            from={{ opacity: 0, translateY: 40 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: index * 100, type: "timing" }}
            style={styles.postCard}
          >
            {/* Header */}
            <View style={styles.postHeader}>
              <Image source={{ uri: item.profiles.avatar_url }} style={styles.avatar} />
              <Text style={styles.username}>{item.profiles.username}</Text>
            </View>

            {/* Contenido */}
            {item.media_url ? (
              <>
                <Image source={{ uri: item.media_url }} style={styles.postImage} />
                {item.caption ? (
                  <Text style={styles.captionText}>{item.caption}</Text>
                ) : null}
              </>
            ) : (
              <Text style={styles.textPostContent}>{item.caption}</Text>
            )}

            {/* Animación del like */}
            <AnimatePresence>
              {likeAnimation === item.id && (
                <MotiView style={styles.likeAnimationContainer}>
                  <LottieView
                    source={require("../../assets/animations/heart.json")}
                    autoPlay
                    loop={false}
                    style={{ width: 150, height: 150 }}
                  />
                </MotiView>
              )}
            </AnimatePresence>

            {/* Acciones */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                onPress={() => handleLike(item.id, item.liked_by_user)}
                style={styles.actionBtn}
              >
                <Heart
                  size={24}
                  color={item.liked_by_user ? "#e63946" : "#555"}
                  fill={item.liked_by_user ? "#e63946" : "transparent"}
                />
                <Text style={styles.actionText}>{item.likes_count || 0}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleOpenComments(item.id)}
                style={styles.actionBtn}
              >
                <MessageCircle size={22} color="#555" />
                <Text style={styles.actionText}>{item.comments_count || 0}</Text>
              </TouchableOpacity>
            </View>
          </MotiView>
        )}

      />

      {/* Modal de comentarios */}
      <Modal visible={commentsModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            {/* Header del modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comentarios</Text>
              <Pressable onPress={handleCloseComments}>
                <X size={26} color="#333" />
              </Pressable>
            </View>

            {/* Lista de comentarios */}
            <FlatList
              data={comments}
              keyExtractor={(c) => c.id}
              refreshing={loadingComments}
              onRefresh={() => fetchComments(selectedPostId)}
              contentContainerStyle={{ paddingBottom: 12 }}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <Image source={{ uri: item.profiles.avatar_url }} style={styles.commentAvatar} />
                  <View style={styles.commentContent}>
                    <Text style={styles.commentUsername}>{item.profiles.username}</Text>
                    <Text style={styles.commentText}>{item.content}</Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={<Text style={styles.noCommentsText}>Aún no hay comentarios 😄</Text>}
            />

            {/* Input de comentario */}
            <View style={styles.commentInputContainer}>
              <TextInput
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Escribe un comentario..."
                placeholderTextColor="#999"
                style={styles.commentInput}
              />
              <TouchableOpacity
                onPress={() => {
                  if (commentText.trim() !== "") {
                    handleAddComment(selectedPostId, commentText);
                    setCommentText("");
                  }
                }}
                style={styles.sendBtn}
              >
                <Send size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// 🧩 Estilos mejorados
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6f9" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f4f6f9" },
  loadingText: { marginTop: 12, color: "#0554F2", fontWeight: "600" },

  // NavBar
  navBar: {
    width: "100%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f4f6f9",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  navTitle: { fontSize: 18, fontWeight: "700", color: "#222" },
  navButton: {
    padding: 8,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },

  postCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 12,
    marginVertical: 8,
    padding: 10,
    shadowColor: "#eee",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },

  postHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  avatar: { width: 42, height: 42, borderRadius: 21, marginRight: 10 },
  username: { fontWeight: "600", fontSize: 16, color: "#222" },
  postImage: { width: "100%", height: 320, borderRadius: 12, marginTop: 8 },
  textPostContent: { fontSize: 15, color: "#111", marginVertical: 8 },

  actionsRow: {
    flexDirection: "row",
    marginTop: 8,
    alignItems: "center",
  },
  actionBtn: { flexDirection: "row", alignItems: "center", marginRight: 20 },
  actionText: { marginLeft: 4, color: "#333", fontSize: 14 },
  likeAnimationContainer: {
    position: "absolute",
    top: "35%",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },

  // Modal
  modalContainer: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  modalContent: {
    backgroundColor: "#fff",
    maxHeight: "80%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#222" },

  commentItem: { flexDirection: "row", alignItems: "flex-start", marginBottom: 14 },
  commentAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  commentContent: { backgroundColor: "#f4f6f9", borderRadius: 10, padding: 8, flex: 1 },
  commentUsername: { fontWeight: "600", color: "#222" },
  commentText: { color: "#333", marginTop: 2 },
  noCommentsText: { textAlign: "center", color: "#999", marginVertical: 20 },

  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingVertical: 6,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 25,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: "#f9fafb",
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: "#0554F2",
    padding: 10,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  captionText: {
  fontSize: 14,
  color: "#333",
  marginTop: 6,
  marginHorizontal: 4,
},
});
