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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { AuthContext } from "@/contexts/AuthContext";
import { Camera } from "lucide-react-native";

export default function EditProfile() {
  const router = useRouter();
  const { user, updateProfile } = useContext(AuthContext);

  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [birthDate, setBirthDate] = useState(user?.birth_date || "");
  const [avatar, setAvatar] = useState(user?.avatar_url || "");
  const [cover, setCover] = useState(user?.cover_url || "");

  // 👉 lógica vacía de subir imagen
  const uploadImage = async (uri: string, field: "avatar_url" | "cover_url") => {
    console.log("Subir imagen:", uri, "para campo:", field);
  };

  const pickImage = async (field: "avatar_url" | "cover_url") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: field === "avatar_url" ? [1, 1] : [3, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      if (field === "avatar_url") setAvatar(uri);
      if (field === "cover_url") setCover(uri);
      await uploadImage(uri, field);
    }
  };

  const handleSave = () => {
    console.log("Guardar cambios:", { name, username, birthDate });
    updateProfile({
      ...user,
      name,
      username,
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
            onPress={() => pickImage("cover_url")}
          >
            <Image
              source={{
                uri: cover || "https://picsum.photos/800/300",
              }}
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
              onPress={() => pickImage("avatar_url")}
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

            <TouchableOpacity style={styles.button} onPress={handleSave}>
              <Text style={styles.buttonText}>Guardar cambios</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    right: "40%",
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
