import {
  Text,
  View,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  RefreshControl,
} from "react-native";
import {
  CheckCircle,
  ImageIcon,
  Film,
  Bookmark,
  LogOut,
  Share2,
  MoreVertical,
  Edit3,
} from "lucide-react-native";
import { useState, useContext, useCallback, useEffect } from "react";
import { useRouter } from "expo-router";
import { AuthContext } from "@/contexts/AuthContext";
import { PostContext } from "@/contexts/PostContext";

// Tipos
type Reel = {
  id: string;
  media_url: string;
  user_id: string;
};

type Post = {
  id: string;
  media_url: string;
  user_id: string;
};

export default function Perfil() {
  const [activeTab, setActiveTab] = useState<"posts" | "reels" | "saved">("posts");
  const [menuVisible, setMenuVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { user, logout, fetchUser } = useContext(AuthContext);
  const { posts, reels, fetchPosts, fetchReels } = useContext(PostContext);
  const router = useRouter();

  const handleLogout = async () => {
    setMenuVisible(false);
    await logout();
    router.replace("/(auth)/login");
  };

  const handleEditProfile = () => {
    setMenuVisible(false);
    router.push("/(main)/editprofile");
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchUser(), fetchPosts(), fetchReels()]);
    } finally {
      setRefreshing(false);
    }
  }, [fetchUser, fetchPosts, fetchReels]);

  useEffect(() => {
    fetchPosts();
    fetchReels();
  }, []);

  // ✅ Filtrar publicaciones y reels solo del usuario logueado
  const userPosts = posts.filter((post: Post) => post.user_id === user?.id);
  const userReels = reels.filter((reel: Reel) => reel.user_id === user?.id);

  const renderContent = () => {
    if (activeTab === "posts") {
      if (!userPosts.length) {
        return (
          <View style={styles.centered}>
            <Text style={{ color: "#444" }}>No tienes publicaciones aún 😔</Text>
          </View>
        );
      }
      return (
        <View style={styles.grid}>
          {userPosts.map((post: Post) => (
            <View key={post.id} style={styles.gridItem}>
              <Image source={{ uri: post.media_url } as { uri: string }} style={styles.gridImage} />
            </View>
          ))}
        </View>
      );
    } else if (activeTab === "reels") {
      if (!userReels.length) {
        return (
          <View style={styles.centered}>
            <Text style={{ color: "#444" }}>No tienes Reels aún 🎥</Text>
          </View>
        );
      }
      return (
        <View style={styles.grid}>
          {userReels.map((reel: Reel) => (
            <View key={reel.id} style={styles.gridItem}>
              <Image source={{ uri: reel.media_url }} style={styles.gridImage} />
            </View>
          ))}
        </View>
      );
    } else if (activeTab === "saved") {
      return (
        <View style={styles.centered}>
          <Text style={{ color: "#444" }}>Tus guardados estarán aquí 🔖</Text>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollScreen}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Portada */}
        <View style={styles.coverPhoto}>
          <Image source={{ uri: user?.cover_url }} style={styles.coverImage} />
        </View>

        {/* Perfil */}
        <View style={styles.profileWrapper}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: user?.avatar_url }}
              style={styles.profileImage}
            />
          </View>
          <View style={styles.userInfo}>
            <View style={styles.usernameRow}>
              <Text style={styles.username}>{user?.name || "Usuario"}</Text>
              <CheckCircle size={20} color="#0554F2" style={{ marginLeft: 6 }} />
            </View>
            <Text style={styles.handle}>@{user?.email?.split("@")[0]}</Text>
          </View>

          {/* Menú */}
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <MoreVertical size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{userPosts.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>2.5K</Text>
            <Text style={styles.statLabel}>Seguidores</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>300</Text>
            <Text style={styles.statLabel}>Siguiendo</Text>
          </View>
        </View>

        {/* Bio */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Bio</Text>
          <Text style={styles.bioText}>
            🚀 Innovando en tecnología y educación.{"\n"}
            Amante del café ☕, la programación 💻 y los gatos 🐱.
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            onPress={() => setActiveTab("posts")}
            style={styles.tab}
          >
            <ImageIcon
              size={24}
              color={activeTab === "posts" ? "#0554F2" : "#888"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("reels")}
            style={styles.tab}
          >
            <Film
              size={24}
              color={activeTab === "reels" ? "#0554F2" : "#888"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("saved")}
            style={styles.tab}
          >
            <Bookmark
              size={24}
              color={activeTab === "saved" ? "#0554F2" : "#888"}
            />
          </TouchableOpacity>
        </View>

        {/* Contenido */}
        {renderContent()}
      </ScrollView>

      {/* Menú Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setMenuVisible(false)}
        >
          <View style={styles.bottomMenu}>
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <LogOut size={18} color="#ef4444" />
              <Text style={styles.menuText}>Cerrar sesión</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
              <Edit3 size={18} color="#3b82f6" />
              <Text style={styles.menuText}>Editar perfil</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  scrollScreen: { paddingBottom: 100 },
  coverPhoto: { width: "100%", height: 180, backgroundColor: "#ccc" },
  coverImage: { width: "100%", height: "100%" },
  profileWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -40,
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  avatarWrapper: { position: "relative" },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "#fff",
  },
  userInfo: { marginLeft: 15, flex: 1 },
  usernameRow: { flexDirection: "row", alignItems: "center" },
  username: { fontSize: 22, fontWeight: "bold", color: "#000" },
  handle: { fontSize: 14, color: "#555" },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 15,
  },
  stat: { alignItems: "center" },
  statNumber: { fontSize: 18, fontWeight: "bold" },
  statLabel: { fontSize: 12, color: "#666" },
  card: {
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 20,
    margin: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#111",
  },
  bioText: { fontSize: 14, color: "#444", lineHeight: 20 },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingVertical: 10,
  },
  tab: { alignItems: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  gridItem: { width: "33.33%", aspectRatio: 1 },
  gridImage: { width: "100%", height: "100%" },
  centered: { alignItems: "center", justifyContent: "center", height: 200 },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  bottomMenu: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 30,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  menuText: { fontSize: 16, marginLeft: 10, color: "#111" },
});
