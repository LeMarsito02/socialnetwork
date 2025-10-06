  import React, { useContext, useState } from "react";
  import {
    Text,
    View,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    Image,
    ActivityIndicator,
  } from "react-native";
  import { useRouter } from "expo-router";
  import { AuthContext } from "@/contexts/AuthContext";
  import { Camera } from "lucide-react-native";
  import CameraModal from "@/Components/camera_modal"; // 📸 modal
  import { supabase } from "@/utils/supabase"; // 👈 tu cliente supabase
  import * as FileSystem from "expo-file-system";

  export default function EditProfile() {
    const router = useRouter();
    const { user, updateProfile,fetchUser } = useContext(AuthContext);

    const [name, setName] = useState(user?.name || "");
    const [username, setUsername] = useState(user?.username || "");
    const [birthDate, setBirthDate] = useState(user?.birth_date || "");
    const [avatar, setAvatar] = useState(user?.avatar_url || "");
    const [cover, setCover] = useState(user?.cover_url || "");

    const [modalVisible, setModalVisible] = useState<null | "avatar" | "cover">(null);
    const [uploading, setUploading] = useState(false);


    const uploadImage = async (
      uri: string,
      field: "avatar_url" | "cover_url"
    ) => {
      if (!user) return;

      try {
        setUploading(true);

        // leer archivo como arrayBuffer → Uint8Array
        const response = await fetch(uri);
        const arrayBuffer = await response.arrayBuffer();
        const fileData = new Uint8Array(arrayBuffer);

        // nombre único
        const fileExt = "jpg";
        const fileName = `${field}-${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        // subir a storage
        const { error: uploadError } = await supabase.storage
          .from("profileimages")
          .upload(filePath, fileData, {
            contentType: "image/jpeg",
            upsert: true,
          });

        if (uploadError) throw uploadError;

        // obtener URL pública
        const { data } = supabase.storage
          .from("profileimages")
          .getPublicUrl(filePath);

        const publicUrl = data.publicUrl;

        // actualizar perfil
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ [field]: publicUrl })
          .eq("id", user.id);

        if (updateError) throw updateError;

        console.log(`✅ Imagen subida y perfil actualizado (${field})`);

        return publicUrl;
      } catch (err: any) {
        console.error("Error subiendo imagen:", err.message);
      } finally {
        setUploading(false);
        await fetchUser(); 
      }
    };




  const handleImageSelected = async (uri: string) => {
    if (modalVisible === "avatar") {
      setAvatar(uri);
      await uploadImage(uri, "avatar_url");
    }
    if (modalVisible === "cover") {
      setCover(uri);
      await uploadImage(uri, "cover_url");
    }
    setModalVisible(null); // cerrar modal
  };


    const handleSave = () => {
      console.log("Guardar cambios:", { name, username, birthDate });
      updateProfile({
        ...user,
        name,
        username,
        birth_date: birthDate,
      });
      router.back();
    };

    return (
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.main}>
            {/* Cover */}
            <TouchableOpacity
              style={styles.coverPhoto}
              onPress={() => setModalVisible("cover")}
            >
              <Image
                source={{ uri: cover || "https://picsum.photos/800/300" }}
                style={styles.coverImage}
              />
              <View style={styles.coverOverlay}>
                <Camera size={20} color="#fff" />
              </View>
            </TouchableOpacity>

            {/* Avatar */}
            <View style={styles.avatarWrapper}>
              <Image
                source={{
                  uri:
                    avatar ||
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSq4RJtlHXPOmk6LjBrVrzyO6BNdvjSVBYW_g&s",
                }}
                style={styles.profileImage}
                
              />
              <TouchableOpacity
                style={styles.cameraIcon}
                onPress={() => setModalVisible("avatar")}
              >
                <Camera size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.card}>
              <Text style={styles.title}>Editar Perfil</Text>

              <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={name}
                onChangeText={setName}
              />

              <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />

              <TextInput
                style={styles.input}
                placeholder="Fecha de nacimiento (YYYY-MM-DD)"
                value={birthDate}
                onChangeText={setBirthDate}
              />

              <TouchableOpacity
                style={styles.button}
                onPress={handleSave}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Guardar cambios</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* 📸 Modal de cámara */}
        <CameraModal
          visible={modalVisible !== null}
          onClose={() => setModalVisible(null)}
          onSelect={handleImageSelected}
        />
      </SafeAreaView>
    );
  }


  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: "#FFFFFF",
    },
    main: {
      flex: 1,
      alignItems: "center",
      backgroundColor: "#FFFFFF",
    },

    // Cover
    coverPhoto: { width: "100%", height: 150, backgroundColor: "#ccc" },
    coverImage: { width: "100%", height: "100%" },
    coverOverlay: {
      position: "absolute",
      right: 15,
      bottom: 15,
      backgroundColor: "rgba(0,0,0,0.5)",
      borderRadius: 20,
      padding: 6,
    },

    // Avatar
    avatarWrapper: { marginTop: -40, alignItems: "center", position: "relative" },
    profileImage: {
      width: 90,
      height: 90,
      borderRadius: 45,
      borderWidth: 3,
      borderColor: "#fff",
    },
    cameraIcon: {
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: "#0554F2",
      borderRadius: 20,
      padding: 5,
    },

    // Form
    card: {
      width: "90%",
      backgroundColor: "#fff",
      padding: 25,
      borderRadius: 16,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5,
      marginTop: 20,
    },
    title: {
      fontSize: 22,
      fontWeight: "bold",
      marginBottom: 20,
      textAlign: "center",
    },
    input: {
      width: "100%",
      height: 50,
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 12,
      paddingHorizontal: 15,
      marginTop: 15,
      backgroundColor: "#f9f9f9",
      fontSize: 16,
    },
    button: {
      width: "100%",
      height: 50,
      backgroundColor: "#0554F2",
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 25,
    },
    buttonText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "bold",
    },
  });
