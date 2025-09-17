import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { useRouter, Link } from "expo-router";
import React, { useContext, useState } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { User } from "@/types/common.type";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView, MotiText } from "moti";

export default function Register() {
  const router = useRouter();
  const context = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState<string>("");
  const [showPicker, setShowPicker] = useState(false);

  // Maneja cambio/dismiss del DateTimePicker correctamente en ambas plataformas
  const handleDateChange = (_event: any, selectedDate?: Date) => {
    // En Android la llamada al onChange se comporta como dialog: si el usuario cancela,
    // event.type === 'dismissed' (o selectedDate === undefined) — no guardamos la fecha.
    // Además cerramos el picker en Android al recibir la respuesta.
    if (Platform.OS === "android") {
      setShowPicker(false);
      // _event?.type puede ser "set" o "dismissed"
      if (_event?.type === "dismissed") return;
    }

    if (selectedDate) {
      const formatted = selectedDate.toISOString().split("T")[0]; // YYYY-MM-DD
      setBirthdate(formatted);
    }
  };

  const user: User = {
    email,
    name,
    username,
    birth_date: birthdate,
  };

  const handleRegister = async () => {
    try {
      const response = await context.register(user, password);
      if (response) {
        router.replace("/(main)");
      } else {
        console.log("Error en el registro");
      }
    } catch (error) {
      console.error("Error inesperado en el registro:", error);
    }
  };

  return (
    <LinearGradient colors={["#0554F2", "#3098F2"]} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <MotiView
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", damping: 18 }}
            style={styles.card}
          >
            {/* Títulos */}
            <MotiText
              from={{ opacity: 0, translateY: 8 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 80, type: "spring", damping: 18 }}
              style={styles.title}
            >
              Create Account
            </MotiText>

            <MotiText
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 160 }}
              style={styles.subtitle}
            >
              Sign up with your LeMarTek student account
            </MotiText>

            {/* Inputs */}
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 260, type: "spring", damping: 16 }}
            >
              <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor="#888"
                value={name}
                onChangeText={setName}
              />
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 320, type: "spring", damping: 16 }}
            >
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#888"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </MotiView>

            {/* Fecha - single, integrado en la card */}
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 380, type: "spring", damping: 16 }}
            >
              <TouchableOpacity
                style={[styles.input, styles.dateInput]}
                onPress={() => setShowPicker(true)}
                activeOpacity={0.8}
              >
                <Text style={{ color: birthdate ? "#000" : "#888", fontSize: 16 }}>
                  {birthdate || "Select your birthdate"}
                </Text>
                <Text style={{ color: "#888" }}>📅</Text>
              </TouchableOpacity>
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 440, type: "spring", damping: 16 }}
            >
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#888"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 500, type: "spring", damping: 16 }}
            >
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#888"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </MotiView>

            {/* Botón */}
            <MotiView
              from={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 560, type: "spring", damping: 20 }}
            >
              <TouchableOpacity onPress={handleRegister} activeOpacity={0.85}>
                <LinearGradient colors={["#0554F2", "#3098F2"]} style={styles.button}>
                  <Text style={styles.buttonText}>Sign up</Text>
                </LinearGradient>
              </TouchableOpacity>
            </MotiView>

            {/* Link Login */}
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 640 }}
              style={styles.registerContainer}
            >
              <Text style={styles.registerText}>Already have an account?</Text>
              <Link href="/" asChild>
                <TouchableOpacity>
                  <Text style={styles.registerLink}> Login</Text>
                </TouchableOpacity>
              </Link>
            </MotiView>
          </MotiView>

          {/* iOS Modal: showPicker controla la visibilidad */}
          {Platform.OS === "ios" && (
            <Modal
              transparent
              visible={showPicker}
              animationType="slide"
              onRequestClose={() => setShowPicker(false)}
            >
              <View style={styles.modalBackground}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Choose your birthdate</Text>
                  <DateTimePicker
                    value={birthdate ? new Date(birthdate) : new Date()}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    // textColor es iOS-only, ayuda con temas oscuros
                    //@ts-ignore
                    textColor="black"
                    style={styles.datePicker}
                  />
                  <TouchableOpacity
                    style={styles.doneButton}
                    onPress={() => setShowPicker(false)}
                  >
                    <Text style={styles.doneButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}

          {/* Android DateTimePicker: se renderiza cuando showPicker === true.
              En Android la UI nativa aparece y onChange maneja set/dismiss */}
          {Platform.OS === "android" && showPicker && (
            <View style={styles.androidPickerWrapper}>
              <DateTimePicker
                value={birthdate ? new Date(birthdate) : new Date()}
                mode="date"
                display="spinner" // spinner es más confiable en muchos dispositivos
                onChange={handleDateChange}
              />
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  card: {
    marginHorizontal: 16,
    marginTop: 40,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 22,
    // sombra
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
    marginBottom: 6,
    textAlign: "left",
  },
  subtitle: { fontSize: 14, color: "#555", marginBottom: 16 },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginTop: 12,
    backgroundColor: "#f9f9f9",
    fontSize: 16,
    justifyContent: "center",
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  button: {
    width: "100%",
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
    flexWrap: "wrap",
  },
  registerText: { fontSize: 14, color: "#555" },
  registerLink: { fontSize: 14, color: "#0554F2", fontWeight: "700" },

  modalBackground: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modalContent: {
    backgroundColor: "#fff",
    paddingTop: 12,
    paddingBottom: 22,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  datePicker: {
    width: "100%",
  },
  doneButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  doneButtonText: {
    fontSize: 16,
    color: "#0554F2",
    fontWeight: "600",
  },

  androidPickerWrapper: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 8,
    elevation: 8, // sombra en Android
    marginHorizontal: 20,
    marginTop: 10,
  },
});
