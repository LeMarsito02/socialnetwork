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
} from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import LottieView from "lottie-react-native";
import { Heart, MessageCircle, Share2, Pause } from "lucide-react-native";
import { PostContext } from "@/contexts/PostContext";
import { useFocusEffect } from "@react-navigation/native";

const { height, width } = Dimensions.get("window");

function ReelItem({ post, isActive }) {
  const { handleLike, likeAnimation } = useContext(PostContext);

  const [paused, setPaused] = useState(true);
  const [showPauseIcon] = useState(new Animated.Value(0));
  const [showHeart] = useState(new Animated.Value(0));
  const lastTap = useRef(0);

  const videoUrl =
    post.media_url ||
    "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4";

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
      Animated.timing(showPauseIcon, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(showPauseIcon, {
        toValue: 0,
        duration: 400,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateHeart = () => {
    showHeart.setValue(0);
    Animated.spring(showHeart, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(showHeart, {
        toValue: 0,
        duration: 300,
        delay: 400,
        useNativeDriver: true,
      }).start();
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

      <Animated.View
        style={[
          styles.pauseIconContainer,
          { opacity: showPauseIcon, transform: [{ scale: showPauseIcon }] },
        ]}
      >
        <Pause color="#fff" size={64} />
      </Animated.View>

      <Animated.View
        style={[
          styles.heartOverlay,
          {
            opacity: showHeart,
            transform: [
              {
                scale: showHeart.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1.2],
                }),
              },
            ],
          },
        ]}
      >
        <Heart color="#ff0000" size={100} fill="#ff0000" />
      </Animated.View>

      <View style={styles.textContainer}>
        <Text style={styles.username}>@{post.profiles?.username}</Text>
        <Text style={styles.caption}>{post.caption || ""}</Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleLike(post.id, post.liked_by_user)}
        >
          <Heart
            color={post.liked_by_user ? "#ff0000" : "#fff"}
            fill={post.liked_by_user ? "#ff0000" : "none"}
            size={28}
          />
          <Text style={styles.actionText}>{post.likes_count || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <MessageCircle color="#fff" size={28} />
          <Text style={styles.actionText}>{post.comments_count || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Share2 color="#fff" size={26} />
          <Text style={styles.actionText}>10</Text>
        </TouchableOpacity>
      </View>
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
        <LottieView
          source={require("@/assets/animations/loading.json")}
          autoPlay
          loop
          style={{ width: 120, height: 120 }}
        />
      </View>
    );
  }

  if (!reels || reels.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <LottieView
          source={require("@/assets/animations/cloud_loading.json")}
          autoPlay
          loop
          style={{ width: 160, height: 160 }}
        />
        <Text style={styles.emptyText}>jajaj no hay ningún reel todavía 😂</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reels}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <ReelItem post={item} isActive={index === activeIndex} />
        )}
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

      <TouchableOpacity
        style={{ position: "absolute", top: 50, right: 20, zIndex: 20 }}
        onPress={handleRefresh}
      >
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
});
