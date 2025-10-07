import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Video } from "expo-av";
import { supabase } from "../../utils/supabase";
import { AuthContext } from "@/contexts/AuthContext";
import CameraModalReel from "@/Components/camera_reel_modal";

export default function NewPostScreen() {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const [caption, setCaption] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [videoUri, setVideoUri] = useState(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [type, setType] = useState("post");
  const [loading, setLoading] = useState(false);

  // 📸 Tomar foto
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      return Alert.alert("Permiso denegado", "Se necesita acceso a la cámara 📷");
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.9,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setImageUri(result.assets[0].uri);
      setShowImageModal(false);
      setType("post");
    }
  };

  // 🖼️ Elegir imagen
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return Alert.alert("Permiso denegado", "Se necesita acceso a tu galería 🖼️");
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.9,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setImageUri(result.assets[0].uri);
      setShowImageModal(false);
      setType("post");
    }
  };

  // 🎬 Elegir video
  const handlePickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return Alert.alert("Permiso denegado", "Se necesita acceso a tu galería 📁");
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.9,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setVideoUri(result.assets[0].uri);
      setType("reel");
    }
  };

  // 🔹 Subir archivo (imagen o video) a Supabase
  const uploadMediaToSupabase = async (uri, isVideo = false) => {
    if (!user?.id) throw new Error("Usuario no autenticado");

    try {
      const extFromUri =
        uri.split(".").pop()?.split("?")[0]?.split("#")[0] || (isVideo ? "mp4" : "jpg");
      const fileExt = extFromUri.length <= 5 ? extFromUri : isVideo ? "mp4" : "jpg";
      const fileName = `${isVideo ? "reel" : "post"}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const response = await fetch(uri);
      if (!response.ok) throw new Error("No se pudo leer el archivo local");
      const arrayBuffer = await response.arrayBuffer();
      const fileData = new Uint8Array(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from("posts")
        .upload(filePath, fileData, {
          contentType: `${isVideo ? "video" : "image"}/${fileExt}`,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("posts").getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error("❌ Error al subir archivo:", error);
      throw error;
    }
  };

  // 📤 Publicar
  const handlePublish = async () => {
    if (!user) {
      return Alert.alert("Error", "Debes iniciar sesión para publicar.");
    }

    if (type === "post" && !caption.trim() && !imageUri) {
      return Alert.alert("Error", "Escribe algo o agrega una imagen antes de publicar.");
    }
    if (type === "reel" && !videoUri) {
      return Alert.alert("Error", "Graba o selecciona un video antes de publicar.");
    }

    try {
      setLoading(true);
      let mediaUrl = null;
      let mediaType = "text";

      if (type === "reel" && videoUri) {
        mediaUrl = await uploadMediaToSupabase(videoUri, true);
        mediaType = "reel";
      } else if (imageUri) {
        mediaUrl = await uploadMediaToSupabase(imageUri, false);
        mediaType = "image";
      }

      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        caption: caption.trim() || null,
        media_url: mediaUrl,
        media_type: mediaType,
      });

      if (error) throw error;

      Alert.alert("Publicado", "Tu publicación fue creada correctamente 💫");

      // Reset
      setCaption("");
      setImageUri(null);
      setVideoUri(null);
      setType("post");
      router.back();
    } catch (err) {
      console.error("Error al publicar:", err);
      Alert.alert("Error", "No se pudo crear la publicación 😢");
    } finally {
      setLoading(false);
    }
  };

// 🔹 Contenido del Post actualizado
const renderPostContent = () => (
  <>
    {imageUri ? (
      <>
        <Image source={{ uri: imageUri }} style={styles.mediaPreview} />
        <TextInput
          placeholder="Escribe un caption..."
          value={caption}
          onChangeText={setCaption}
          style={styles.input}
          multiline
        />
        <View style={{ flexDirection: "row", marginTop: 10 }}>
          <TouchableOpacity onPress={() => setImageUri(null)} style={styles.removeImage}>
            <Text style={{ color: "#fff" }}>Quitar imagen</Text>
          </TouchableOpacity>
        </View>
      </>
    ) : (
      <>
        <TextInput
          placeholder="¿Qué estás pensando?"
          placeholderTextColor="#777"
          value={caption}
          onChangeText={setCaption}
          style={[styles.input, { minHeight: 200, textAlignVertical: "top" }]}
          multiline
        />
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
          <TouchableOpacity onPress={handlePickImage} style={styles.uploadButton}>
            <Text style={styles.uploadText}>🖼️ Elegir imagen</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleTakePhoto} style={styles.uploadButton}>
            <Text style={styles.uploadText}>📸 Tomar foto</Text>
          </TouchableOpacity>
        </View>
      </>
    )}
  </>
);

// 🔹 Contenido del Reel actualizado (sin grabar video)
const renderReelContent = () => (
  <View style={{ alignItems: "center", marginTop: 20 }}>
    {videoUri ? (
      <>
        <Text style={{ color: "#333", marginBottom: 8 }}>Vista previa del Reel 🎥</Text>
        <Video
          source={{ uri: videoUri }}
          style={styles.videoPreview}
          resizeMode="cover"
          useNativeControls
          shouldPlay={false}
        />

        {/* Campo de descripción del Reel */}
        <TextInput
          placeholder="Escribe una descripción para tu Reel..."
          value={caption}
          onChangeText={setCaption}
          style={[styles.input, { marginTop: 12 }]}
          multiline
        />

        <View style={{ flexDirection: "row", marginTop: 12 }}>
          <TouchableOpacity onPress={() => setVideoUri(null)} style={styles.removeImage}>
            <Text style={{ color: "#fff" }}>Quitar video</Text>
          </TouchableOpacity>
        </View>
      </>
    ) : (
      <TouchableOpacity
        style={[styles.uploadButton, { paddingVertical: 20, paddingHorizontal: 30 }]}
        onPress={handlePickVideo}
      >
        <Text style={styles.uploadText}>🎬 Elegir video desde galería</Text>
      </TouchableOpacity>
    )}
  </View>
);



  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancel}>Cancelar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Nuevo {type === "reel" ? "Reel" : "Post"}</Text>
        <TouchableOpacity onPress={handlePublish} disabled={loading}>
          {loading ? <ActivityIndicator color="#0554F2" /> : <Text style={styles.postButton}>Publicar</Text>}
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, type === "post" && styles.activeTab]}
          onPress={() => setType("post")}
        >
          <Text style={[styles.tabText, { color: type === "post" ? "#0554F2" : "#333" }]}>Post</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, type === "reel" && styles.activeTab]}
          onPress={() => {
            setType("reel");
            setShowCameraModal(true);
          }}
        >
          <Text style={[styles.tabText, { color: type === "reel" ? "#0554F2" : "#333" }]}>Reel</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }}>
        {type === "post" ? renderPostContent() : renderReelContent()}
      </ScrollView>

      {/* Modal cámara */}
      <CameraModalReel
        visible={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onVideoRecorded={(uri) => {
          setVideoUri(uri);
          setType("reel");
          setShowCameraModal(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    alignItems: "center",
  },
  cancel: { color: "#555", fontSize: 16 },
  title: { fontWeight: "bold", fontSize: 17 },
  postButton: { color: "#0554F2", fontWeight: "600", fontSize: 16 },
  tabs: {
    flexDirection: "row",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  tab: { flex: 1, padding: 12, alignItems: "center" },
  activeTab: { borderBottomWidth: 2, borderBottomColor: "#0554F2" },
  tabText: { fontSize: 15, fontWeight: "500" },
  input: {
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
  },
  mediaPreview: {
    width: "100%",
    height: 300,
    borderRadius: 10,
    marginBottom: 12,
  },
  uploadButton: {
    backgroundColor: "#e8f0ff",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  uploadText: { color: "#0554F2", fontWeight: "600" },
  removeImage: {
    backgroundColor: "#ff4d4d",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  videoPreview: { width: "100%", height: 300, borderRadius: 10 },
  modalButton: {
    backgroundColor: "#e8e8e8",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalButtonText: { color: "#333", fontWeight: "600" },
});
