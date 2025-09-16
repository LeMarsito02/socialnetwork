import { Text, View, StyleSheet, Image, ScrollView, SafeAreaView, TouchableOpacity } from "react-native";
import { CheckCircle, ImageIcon, Film, Bookmark } from "lucide-react-native"; // íconos para tabs
import { useState } from "react";

export default function Perfil() {
  const [activeTab, setActiveTab] = useState("posts");

  const renderContent = () => {
    if (activeTab === "posts") {
      return (
        <View style={styles.grid}>
          {/* Ejemplo de posts */}
          <View style={styles.postCard}>
            <Image
              source={{ uri: "https://lemartek.com" }}
              style={styles.postImage}
            />
            <Text style={styles.postText}>Mi primer post con gatito 🐱</Text>
          </View>
          <View style={styles.postCard}>
            <Image
              source={{ uri: "https://lemartek.com" }}
              style={styles.postImage}
            />
            <Text style={styles.postText}>Explorando nuevas ideas 💡</Text>
          </View>
        </View>
      );
    } else if (activeTab === "reels") {
      return (
        <View style={styles.centered}>
          <Text style={{ color: "#444" }}>Aquí aparecerán tus Reels 🎥</Text>
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
      <ScrollView contentContainerStyle={styles.container}>
        {/* Foto de perfil */}
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSq4RJtlHXPOmk6LjBrVrzyO6BNdvjSVBYW_g&s" }}
            style={styles.profileImage}
          />
          <View style={styles.userInfo}>
            <View style={styles.usernameRow}>
              <Text style={styles.username}>LeMarTek</Text>
              <CheckCircle size={20} color="#0554F2" style={{ marginLeft: 6 }} />
            </View>
            <Text style={styles.handle}>@lemartek_official</Text>
          </View>
        </View>

        <View style={styles.vistica}>
            <TouchableOpacity style={[styles.button, styles.follow]}>
                <Text style={styles.text}>Seguir</Text>
            </TouchableOpacity>
        </View>
        {/* Biografía */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Bio</Text>
          <Text style={styles.bioText}>
            🚀 Innovando en tecnología y educación.{"\n"}
            Amantes del café ☕, la programación 💻 y los gatos 🐱.
          </Text>
        </View>

        {/* Intereses */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Intereses</Text>
          <View style={styles.interestsContainer}>
            <View style={styles.interestChip}>
              <Text style={styles.chipText}>Programación</Text>
            </View>
            <View style={styles.interestChip}>
              <Text style={styles.chipText}>IA</Text>
            </View>
            <View style={styles.interestChip}>
              <Text style={styles.chipText}>Gaming</Text>
            </View>
            <View style={styles.interestChip}>
              <Text style={styles.chipText}>Música</Text>
            </View>
          </View>
        </View>

        {/* Tabs tipo Instagram */}
        <View style={styles.tabs}>
          <TouchableOpacity onPress={() => setActiveTab("posts")} style={styles.tab}>
            <ImageIcon size={24} color={activeTab === "posts" ? "#0554F2" : "#444"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab("reels")} style={styles.tab}>
            <Film size={24} color={activeTab === "reels" ? "#0554F2" : "#444"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab("saved")} style={styles.tab}>
            <Bookmark size={24} color={activeTab === "saved" ? "#0554F2" : "#444"} />
          </TouchableOpacity>
        </View>

        {/* Contenido dinámico según tab */}
        {renderContent()}

        {/* Botón editar perfil */}
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Editar perfil</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    padding: 20,
    alignItems: "center",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginRight: 15,
  },
  userInfo: {
    flexDirection: "column",
  },
  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  username: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
  handle: {
    fontSize: 14,
    color: "#555",
  },
  card: {
    width: "100%",
    backgroundColor: "#f9f9f9",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  bioText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  interestChip: {
    backgroundColor: "#0554F2",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  chipText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 8,
  },
  tab: {
    alignItems: "center",
    flex: 1,
  },
  grid: {
    width: "100%",
  },
  postCard: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
  },
  postImage: {
    width: "100%",
    height: 200,
  },
  postText: {
    padding: 10,
    fontSize: 14,
    color: "#333",
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    height: 200,
  },
  editButton: {
    backgroundColor: "#0554F2",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginTop: 20,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
    button: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: "#f0f0f0",
  },
  follow: {
    backgroundColor: "#0554F2", // azul para destacar "Seguir"
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  vistica:
  {
    padding : 4
  },

});
