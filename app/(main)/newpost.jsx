import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  Modal,
  ActivityIndicator,
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
  const [type, setType] = useState("post"); // "post" o "reel"
  const [loading, setLoading] = useState(false);

  // 📸 Tomar foto
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Se necesita acceso a la cámara 📷");
      return;
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

  // 🖼️ Elegir imagen desde galería
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Se necesita acceso a tu galería 🖼️");
      return;
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

  // 🎬 Elegir video desde galería
  const handlePickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Se necesita acceso a tu galería 📁");
      return;
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

  // 🔹 Subir imagen a Supabase
  const uploadImageToSupabase = async (uri) => {
    if (!user?.id) throw new Error("Usuario no autenticado");
    try {
      const extFromUri =
        uri.split(".").pop()?.split("?")[0]?.split("#")[0] || "jpg";
      const fileExt = extFromUri.length <= 5 ? extFromUri : "jpg";
      const fileName = `post-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const response = await fetch(uri);
      if (!response.ok) throw new Error("No se pudo leer el archivo local");
      const arrayBuffer = await response.arrayBuffer();
      const fileData = new Uint8Array(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from("posts")
        .upload(filePath, fileData, {
          contentType: `image/${fileExt}`,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("posts").getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error("❌ Error al subir imagen:", error);
      throw error;
    }
  };

  // 📤 Publicar post/reel
  const handlePublish = async () => {
    if (!user) {
      Alert.alert("Error", "Debes iniciar sesión para publicar.");
      return;
    }

    if (type === "post" && !caption.trim() && !imageUri) {
      Alert.alert("Error", "Escribe algo o agrega una imagen antes de publicar.");
      return;
    }
    if (type === "reel" && !videoUri) {
      Alert.alert("Error", "Graba o selecciona un video antes de publicar.");
      return;
    }

    try {
      setLoading(true);
      let mediaUrl = null;
      let mediaType = "text";

      if (type === "reel" && videoUri) {
        mediaUrl = videoUri; // Aquí puedes implementar subida de video a Supabase
        mediaType = "reel";
      } else if (imageUri) {
        mediaUrl = await uploadImageToSupabase(imageUri);
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

  // 🔹 Renderizado de Post
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
          <TouchableOpacity
            onPress={() => setImageUri(null)}
            style={styles.removeImage}
          >
            <Text style={{ color: "#fff" }}>Quitar imagen</Text>
          </TouchableOpacity>
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
          <TouchableOpacity
            onPress={() => setShowImageModal(true)}
            style={styles.uploadButton}
          >
            <Text style={styles.uploadText}>📸 Agregar imagen</Text>
          </TouchableOpacity>
        </>
      )}
    </>
  );

  // 🔹 Renderizado de Reel
  const renderReelContent = () => {
    if (videoUri) {
      return (
        <View style={{ alignItems: "center", marginTop: 20 }}>
          <Text style={{ color: "#333", marginBottom: 8 }}>
            Vista previa del Reel 🎥
          </Text>
          <Video
            source={{ uri: videoUri }}
            style={styles.videoPreview}
            resizeMode="cover"
            useNativeControls
            shouldPlay={false}
          />
          <View style={{ flexDirection: "row", marginTop: 12 }}>
            <TouchableOpacity
              onPress={() => setVideoUri(null)}
              style={[styles.removeImage, { marginRight: 8 }]}
            >
              <Text style={{ color: "#fff" }}>Quitar video</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowCameraModal(true)}
              style={[styles.modalButton, { backgroundColor: "#f5f7ff" }]}
            >
              <Text style={{ color: "#0554F2", fontWeight: "600" }}>Regrabar</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={{ padding: 20, alignItems: "center" }}>
        <TouchableOpacity
          style={[styles.uploadButton, { paddingVertical: 20, paddingHorizontal: 30 }]}
          onPress={() => setShowCameraModal(true)}
        >
          <Text style={styles.uploadText}>🎬 Grabar Reel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modalButton, { marginTop: 16, width: "60%" }]}
          onPress={handlePickVideo}
        >
          <Text style={styles.modalButtonText}>Elegir video desde galería</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancel}>Cancelar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Nuevo Post</Text>
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

      {/* Contenido */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {type === "post" && renderPostContent()}
        {type === "reel" && renderReelContent()}
      </ScrollView>

      {/* Modal cámara reels */}
      <CameraModalReel
        visible={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onSelect={(uri) => {
          setVideoUri(uri);
          setType("reel");
          setShowCameraModal(false);
        }}
      />

      {/* Modal imagen */}
      <Modal
        visible={showImageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar imagen</Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleTakePhoto}>
              <Text style={styles.modalButtonText}>Tomar foto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={handlePickImage}>
              <Text style={styles.modalButtonText}>Elegir desde galería</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelModalButton]}
              onPress={() => setShowImageModal(false)}
            >
              <Text style={[styles.modalButtonText, { color: "#FF3B30" }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  activeTab: { backgroundColor: "#e8f0fe" },
  tabText: { fontSize: 16, fontWeight: "600" },
  mediaPreview: {
    width: "100%",
    height: 300,
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: "#000",
  },
  videoPreview: {
    width: 300,
    height: 400,
    borderRadius: 12,
    backgroundColor: "#000",
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
    color: "#000000",
  },
  uploadButton: {
    marginTop: 40,
    marginHorizontal: 40,
    paddingVertical: 20,
    backgroundColor: "#f0f4ff",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#0554F2",
  },
  uploadText: { fontSize: 18, fontWeight: "600", color: "#0554F2" },
  removeImage: {
    marginTop: 16,
    marginHorizontal: 40,
    backgroundColor: "#FF3B30",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: "#f5f7ff",
    paddingVertical: 14,
    borderRadius: 12,
    marginVertical: 6,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0554F2",
  },
  cancelModalButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
  },
});
