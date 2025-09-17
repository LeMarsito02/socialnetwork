import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Video } from "expo-video"; // ✅ usar expo-video, no expo-av

export default function NewPostScreen() {
  const router = useRouter();
  const [caption, setCaption] = useState("");
const [type, setType] = useState("image");
  const [imageUri] = useState("https://placekitten.com/600/800");
  const [videoUri] = useState("https://www.w3schools.com/html/mov_bbb.mp4");

  const handlePost = () => {
    if (type === "text" && !caption.trim()) {
      Alert.alert("Error", "Escribe algo antes de publicar.");
      return;
    }
    console.log("✅ Post creado:", { type, caption, imageUri, videoUri });
    router.back();
  };

  const renderContent = () => {
    if (type === "text") {
      return (
        <TextInput
          placeholder="¿Qué estás pensando? ✍️"
          value={caption}
          onChangeText={setCaption}
          style={[styles.input, { minHeight: 200, textAlignVertical: "top" }]}
          multiline
        />
      );
    }

    if (type === "image") {
      return (
        <>
          <Image source={{ uri: imageUri }} style={styles.mediaPreview} />
          <TextInput
            placeholder="Escribe un caption..."
            value={caption}
            onChangeText={setCaption}
            style={styles.input}
            multiline
          />
        </>
      );
    }

    if (type === "reel") {
      return (
        <>
          <Video
            source={{ uri: videoUri }}
            style={styles.mediaPreview}
            resizeMode="cover"
            isLooping
            shouldPlay
          />
          <TextInput
            placeholder="Escribe un caption para tu reel 🎥"
            value={caption}
            onChangeText={setCaption}
            style={styles.input}
            multiline
          />
        </>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancel}>Cancelar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Nuevo Post</Text>
        <TouchableOpacity onPress={handlePost}>
          <Text style={styles.postButton}>Publicar</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, type === "text" && styles.activeTab]}
          onPress={() => setType("text")}
        >
          <Text
            style={[
              styles.tabText,
              { color: type === "text" ? "#0554F2" : "#333" },
            ]}
          >
            Texto
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, type === "image" && styles.activeTab]}
          onPress={() => setType("image")}
        >
          <Text
            style={[
              styles.tabText,
              { color: type === "image" ? "#0554F2" : "#333" },
            ]}
          >
            Imagen
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, type === "reel" && styles.activeTab]}
          onPress={() => setType("reel")}
        >
          <Text
            style={[
              styles.tabText,
              { color: type === "reel" ? "#0554F2" : "#333" },
            ]}
          >
            Reel
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenido dinámico */}
      <View style={{ flex: 1 }}>{renderContent()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  cancel: { color: "#999", fontSize: 16 },
  title: { fontSize: 18, fontWeight: "bold" },
  postButton: { color: "#0554F2", fontSize: 16, fontWeight: "bold" },

  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
    paddingVertical: 10,
  },
  tab: { paddingVertical: 6, paddingHorizontal: 16 },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#0554F2",
  },
  tabText: { fontSize: 16, fontWeight: "600" },

  mediaPreview: {
    width: "100%",
    height: 300,
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: "#000", // para que el video no sea "blanco" antes de cargar
  },
  input: {
    marginTop: 16,
    marginHorizontal: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    fontSize: 16,
    minHeight: 80,
    backgroundColor: "#fafafa",
  },
});
