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

export default function NewPostScreen() {
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [imageUri, setImageUri] = useState("https://placekitten.com/600/800");

  const handlePost = () => {
    if (!caption) {
      Alert.alert("Error", "Escribe un caption antes de publicar.");
      return;
    }
    // Aquí enviarías a tu backend o estado global
    console.log("Post creado:", { caption, imageUri });
    router.back(); // vuelve al feed
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

      {/* Preview de imagen */}
      <Image source={{ uri: imageUri }} style={styles.imagePreview} />

      {/* Caption */}
      <TextInput
        placeholder="Escribe un caption..."
        value={caption}
        onChangeText={setCaption}
        style={styles.input}
        multiline
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  cancel: {
    color: "#999",
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  postButton: {
    color: "#0554F2",
    fontSize: 16,
    fontWeight: "bold",
  },
  imagePreview: {
    width: "100%",
    height: 300,
    marginTop: 16,
  },
  input: {
    marginTop: 16,
    marginHorizontal: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: "top",
  },
});
