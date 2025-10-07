import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "../utils/supabase";
import { AuthContext } from "./AuthContext";

export const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [likeAnimation, setLikeAnimation] = useState(null);

  // 🔹 Cargar POSTS normales (excluyendo tipo "reel")
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
        .neq("media_type", "reel") // ❗ Excluye los reels
        .order("created_at", { ascending: false });

      if (error) throw error;

      let processedPosts = data.map((p) => {
        const username = p.profiles?.username || "User";
        const avatar_url =
          p.profiles?.avatar_url ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            username
          )}&background=random&color=ffffff&rounded=true&size=128`;

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

  // 🔹 Cargar REELS (solo tipo "reel", sin text ni image)
  const fetchReels = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          id,
          media_url,
          likes_count,
          comments_count,
          created_at,
          media_type,
          caption,
          profiles (
            id, username, avatar_url
          )
        `
        )
        .eq("media_type", "reel")
        .order("created_at", { ascending: false });

      if (error) throw error;

      let processedReels = data.map((r) => {
        const username = r.profiles?.username || "User";
        const avatar_url =
          r.profiles?.avatar_url ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            username
          )}&background=random&color=ffffff&rounded=true&size=128`;

        return {
          ...r,
          profiles: { ...r.profiles, avatar_url },
        };
      });

      if (user) {
        const { data: likesData } = await supabase
          .from("post_likes")
          .select("post_id")
          .eq("user_id", user.id);

        const likedPostIds = likesData?.map((l) => l.post_id) || [];
        processedReels = processedReels.map((r) => ({
          ...r,
          liked_by_user: likedPostIds.includes(r.id),
        }));
      }

      setReels(processedReels);
    } catch (err) {
      console.error("❌ Error fetching reels:", err);
    } finally {
      setLoading(false);
    }
  };

  // 💬 Obtener comentarios
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
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            username
          )}&background=random&color=ffffff&rounded=true&size=128`;
        return { ...c, profiles: { ...c.profiles, avatar_url } };
      });

      setComments(processed);
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setLoadingComments(false);
    }
  };

  // ❤️ Like / Dislike
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
              ? { ...p, likes_count: (p.likes_count || 1) - 1, liked_by_user: false }
              : p
          )
        );
        setReels((prev) =>
          prev.map((r) =>
            r.id === postId
              ? { ...r, likes_count: (r.likes_count || 1) - 1, liked_by_user: false }
              : r
          )
        );
      } else {
        await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });

        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, likes_count: (p.likes_count || 0) + 1, liked_by_user: true }
              : p
          )
        );
        setReels((prev) =>
          prev.map((r) =>
            r.id === postId
              ? { ...r, likes_count: (r.likes_count || 0) + 1, liked_by_user: true }
              : r
          )
        );
        setLikeAnimation(postId);
        setTimeout(() => setLikeAnimation(null), 1200);
      }
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  // 💬 Agregar comentario
  const handleAddComment = async (postId, text) => {
    if (!user || !text.trim()) return;

    try {
      const { data, error } = await supabase
        .from("post_comments")
        .insert({
          post_id: postId,
          user_id: user.id,
          content: text.trim(),
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

      const username = data.profiles?.username || "User";
      const avatar_url =
        data.profiles?.avatar_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          username
        )}&background=random&color=ffffff&rounded=true&size=128`;

      const newComment = { ...data, profiles: { username, avatar_url } };
      setComments((prev) => [...prev, newComment]);

      // Actualizar contador en el post o reel
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, comments_count: (p.comments_count || 0) + 1 }
            : p
        )
      );
      setReels((prev) =>
        prev.map((r) =>
          r.id === postId
            ? { ...r, comments_count: (r.comments_count || 0) + 1 }
            : r
        )
      );
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <PostContext.Provider
      value={{
        posts,
        reels,
        setPosts,
        setReels,
        comments,
        setComments,
        loading,
        loadingComments,
        likeAnimation,
        fetchPosts,
        fetchReels, // ✅ nuevo
        fetchComments,
        handleLike,
        handleAddComment,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};
