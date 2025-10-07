import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Pressable,
  Animated,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Image,
  Platform,
} from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import LottieView from "lottie-react-native";
import { Heart, MessageCircle, Share2, Pause, Send, X } from "lucide-react-native";
import { PostContext } from "@/contexts/PostContext";
import { useFocusEffect } from "@react-navigation/native";

const { height, width } = Dimensions.get("window");

function ReelItem({ post, isActive }) {
  const { handleLike, likeAnimation, fetchComments, handleAddComment } = useContext(PostContext);

  const [paused, setPaused] = useState(true);
  const [showPauseIcon] = useState(new Animated.Value(0));
  const [showHeart] = useState(new Animated.Value(0));
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const lastTap = useRef(0);
  const selectedPostId = post.id;

  const videoUrl = post.media_url || "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4";

  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = true;
    if (isActive) {
      player.play();
      setPaused(false);
    } else {
      player.pause();
      setPaused(true);
    }
  });

  useEffect(() => {
    if (!player) return;
    if (isActive) {
      player.play();
      setPaused(false);
    } else {
      player.pause();
      setPaused(true);
    }
  }, [isActive]);

  useEffect(() => {
    player?.addListener("error", (e) => console.log("🎥 Error de video:", e));
  }, [player]);

  const animatePauseIcon = () => {
    Animated.sequence([
      Animated.timing(showPauseIcon, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(showPauseIcon, { toValue: 0, duration: 400, delay: 200, useNativeDriver: true }),
    ]).start();
  };

  const animateHeart = () => {
    showHeart.setValue(0);
    Animated.spring(showHeart, { toValue: 1, friction: 4, useNativeDriver: true }).start(() => {
      Animated.timing(showHeart, { toValue: 0, duration: 300, delay: 400, useNativeDriver: true }).start();
    });
  };

  const handleDoubleTap = () => {
    handleLike(post.id, post.liked_by_user);
    animateHeart();
  };

  const handlePress = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;

    if (now - lastTap.current < DOUBLE_PRESS_DELAY) {
      handleDoubleTap();
    } else {
      lastTap.current = now;
      if (paused) {
        player.play();
      } else {
        player.pause();
      }
      setPaused(!paused);
      animatePauseIcon();
    }
  };

  useEffect(() => {
    if (likeAnimation === post.id) animateHeart();
  }, [likeAnimation]);

  const handleOpenComments = async () => {
    setCommentsModalVisible(true);
    setLoadingComments(true);
    const fetchedComments = await fetchComments(selectedPostId);
    setComments(fetchedComments);
    setLoadingComments(false);
  };

  const handleCloseComments = () => setCommentsModalVisible(false);

  const handleAddCommentLocal = async () => {
    if (commentText.trim() === "") return;
    await handleAddComment(selectedPostId, commentText);
    const updatedComments = await fetchComments(selectedPostId);
    setComments(updatedComments);
    setCommentText("");
  };

  return (
    <View style={styles.reelContainer}>
      {player ? (
        <Pressable onPress={handlePress} style={StyleSheet.absoluteFill}>
          <VideoView
            style={[styles.video, { backgroundColor: "black", zIndex: -1 }]}
            player={player}
            contentFit="cover"
            nativeControls={false}
          />
        </Pressable>
      ) : (
        <View style={styles.videoFallback}>
          <Text style={{ color: "#fff" }}>Video no cargado</Text>
        </View>
      )}

      <Animated.View style={[styles.pauseIconContainer, { opacity: showPauseIcon, transform: [{ scale: showPauseIcon }] }]}>
        <Pause color="#fff" size={64} />
      </Animated.View>

      <Animated.View style={[styles.heartOverlay, { opacity: showHeart, transform: [{ scale: showHeart.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.2] }) }] }]}>
        <Heart color="#ff0000" size={100} fill="#ff0000" />
      </Animated.View>

      <View style={styles.textContainer}>
        <Text style={styles.username}>@{post.profiles?.username}</Text>
        <Text style={styles.caption}>{post.caption || ""}</Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(post.id, post.liked_by_user)}>
          <Heart color={post.liked_by_user ? "#ff0000" : "#fff"} fill={post.liked_by_user ? "#ff0000" : "none"} size={28} />
          <Text style={styles.actionText}>{post.likes_count || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleOpenComments}>
          <MessageCircle color="#fff" size={28} />
          <Text style={styles.actionText}>{post.comments_count || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Share2 color="#fff" size={26} />
          <Text style={styles.actionText}>10</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de comentarios */}
      <Modal visible={commentsModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comentarios</Text>
              <Pressable onPress={handleCloseComments}>
                <X size={26} color="#333" />
              </Pressable>
            </View>

            <FlatList
              data={comments}
              keyExtractor={(c) => c.id}
              refreshing={loadingComments}
              onRefresh={() => handleOpenComments()}
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

            <View style={styles.commentInputContainer}>
              <TextInput
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Escribe un comentario..."
                placeholderTextColor="#999"
                style={styles.commentInput}
              />
              <TouchableOpacity onPress={handleAddCommentLocal} style={styles.sendBtn}>
                <Send size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

export default function ReelsScreen() {
  const { reels, fetchReels, loading } = useContext(PostContext);
  const [activeIndex, setActiveIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      return () => setActiveIndex(-1); // pausar todo al salir
    }, [])
  );

  useEffect(() => {
    fetchReels();
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 80 });

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReels();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <LottieView source={require("@/assets/animations/loading.json")} autoPlay loop style={{ width: 120, height: 120 }} />
      </View>
    );
  }

  if (!reels || reels.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <LottieView source={require("@/assets/animations/cloud_loading.json")} autoPlay loop style={{ width: 160, height: 160 }} />
        <Text style={styles.emptyText}>jajaj no hay ningún reel todavía 😂</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reels}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => <ReelItem post={item} isActive={index === activeIndex} />}
        showsVerticalScrollIndicator={false}
        pagingEnabled
        snapToInterval={height}
        decelerationRate="fast"
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfigRef.current}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      <TouchableOpacity style={{ position: "absolute", top: 50, right: 20, zIndex: 20 }} onPress={handleRefresh}>
        <Text style={{ color: "#fff", fontSize: 20 }}>🔄</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  reelContainer: { width, height, justifyContent: "flex-end", backgroundColor: "#000", overflow: "hidden" },
  video: { ...StyleSheet.absoluteFillObject },
  videoFallback: { ...StyleSheet.absoluteFillObject, backgroundColor: "#111", alignItems: "center", justifyContent: "center" },
  loaderContainer: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", backgroundColor: "#000" },
  pauseIconContainer: { position: "absolute", top: "45%", left: "45%", zIndex: 10 },
  heartOverlay: { position: "absolute", top: "40%", left: "40%", zIndex: 10 },
  textContainer: { position: "absolute", bottom: 90, left: 15 },
  username: { color: "#fff", fontSize: 16, fontWeight: "700", marginBottom: 4 },
  caption: { color: "#fff", fontSize: 14, fontWeight: "400" },
  actionsContainer: { position: "absolute", right: 15, bottom: 100, alignItems: "center" },
  actionButton: { alignItems: "center", marginVertical: 12 },
  actionText: { color: "#fff", fontSize: 13, marginTop: 4 },
  emptyContainer: { flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#fff", fontSize: 16, marginTop: 16, fontWeight: "500" },

  /* Modal comentarios */
  modalContainer: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 12, borderTopRightRadius: 12, maxHeight: "80%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  modalTitle: { fontSize: 18, fontWeight: "600" },
  commentItem: { flexDirection: "row", padding: 10, alignItems: "flex-start" },
  commentAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  commentContent: { flex: 1 },
  commentUsername: { fontWeight: "700", marginBottom: 2 },
  commentText: { fontSize: 14 },
  noCommentsText: { textAlign: "center", padding: 20, color: "#999" },
  commentInputContainer: { flexDirection: "row", padding: 10, borderTopWidth: 1, borderTopColor: "#eee", alignItems: "center" },
  commentInput: { flex: 1, backgroundColor: "#f0f0f0", borderRadius: 20, paddingHorizontal: 15, height: 40 },
  sendBtn: { marginLeft: 8, backgroundColor: "#007AFF", padding: 8, borderRadius: 20 },
});
