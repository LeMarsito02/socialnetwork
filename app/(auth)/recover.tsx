import { 
  Text, 
  View, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform 
} from "react-native";
import { useRouter, Link } from "expo-router";
import React, { useState, useContext } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView, MotiText } from "moti";
import { AuthContext } from "@/contexts/AuthContext";

export default function recover() {
  const router = useRouter();
  const { resetPassword } = useContext(AuthContext);

  const [email, setEmail] = useState("");

  const handleReset = async () => {
    try {
      const response = await resetPassword(email);
      if (response) {
        console.log("Password reset email sent!");
        router.push("/(auth)/login");
      } else {
        console.log("Error resetting password");
      }
    } catch (error) {
      console.log("Reset error", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient 
        colors={["#0554F2", "#3098F2", "#67C6F2"]} 
        style={styles.gradient}
      >
        {/* Fondos decorativos */}
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >          
          <View style={styles.main}>
            <MotiView 
            from={{ opacity: 0, translateY: 10, scale: 0.98 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={{ type: "spring", damping: 20, stiffness: 120 }}
            style={styles.card}
            >
            {/* Títulos */}
            <MotiText 
                from={{ opacity: 0, translateY: 8 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 150, type: "spring", damping: 18 }}
                style={styles.title}
            >
                Reset your password
            </MotiText>
            
            <MotiText 
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 300 }}
                style={styles.subtitle}
            >
                Enter your registered email and we’ll send you a reset link.
            </MotiText>

            {/* Input */}
            <MotiView 
                from={{ opacity: 0, translateY: 8 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 500, type: "spring", damping: 18 }}
            >
                <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                />
            </MotiView>

            {/* Botón de reset */}
            <MotiView 
                from={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 700, type: "spring", damping: 20 }}
            >
                <TouchableOpacity onPress={handleReset} activeOpacity={0.85}>
                <LinearGradient 
                    colors={["#0554F2", "#3098F2"]}
                    style={styles.button}
                >
                    <Text style={styles.buttonText}>Send Reset Link</Text>
                </LinearGradient>
                </TouchableOpacity>
            </MotiView>

            {/* Volver al login */}
            <MotiView 
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 900 }}
                style={styles.registerContainer}
            >
                <Text style={styles.registerText}>Remembered your password?</Text>
                <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                    <Text style={styles.registerLink}> Sign in</Text>
                </TouchableOpacity>
                </Link>
            </MotiView>
            </MotiView>

          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  gradient: { flex: 1 },
  main: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#555",
    marginBottom: 25,
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 52,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 14,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
    fontSize: 16,
  },
  button: {
    width: "100%",
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    flexWrap: "wrap",
  },
  registerText: {
    fontSize: 14,
    color: "#555",
  },
  registerLink: {
    fontSize: 14,
    color: "#0554F2",
    fontWeight: "bold",
  },
  circle: {
    position: "absolute",
    borderRadius: 200,
    opacity: 0.25,
  },
  circle1: {
    width: 300,
    height: 300,
    backgroundColor: "#fff",
    top: -100,
    left: -100,
  },
  circle2: {
    width: 200,
    height: 200,
    backgroundColor: "#3098F2",
    bottom: 50,
    right: -80,
  },
  circle3: {
    width: 150,
    height: 150,
    backgroundColor: "#67C6F2",
    bottom: -50,
    left: -50,
  },
});
