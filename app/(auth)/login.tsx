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
import React, { useContext, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView, MotiText } from "moti";
import { AuthContext } from "@/contexts/AuthContext";

export default function EntryPoint() {
  const router = useRouter();
  const context = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const response = await context.login(email, password);
    if (response) {
      router.navigate("/(main)");
    } else {
      console.log("Credenciales inválidas");
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
              from={{ opacity: 0, translateY: 40 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "spring", damping: 15 }}
              style={styles.card}
            >
              {/* Títulos */}
              <MotiText 
                from={{ opacity: 0, translateY: -20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 150 }}
                style={styles.title}
              >
                Welcome to{"\n"}StudentHub by LeMarTek
              </MotiText>
              
              <MotiText 
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 300 }}
                style={styles.subtitle}
              >
                Hey! Sign in with your LeMarTek student account
              </MotiText>

              {/* Inputs */}
              <MotiView 
                from={{ opacity: 0, translateX: -40 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ delay: 500 }}
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

              <MotiView 
                from={{ opacity: 0, translateX: 40 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ delay: 650 }}
              >
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#999"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </MotiView>

              {/* Botón de login */}
              <MotiView 
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 800, type: "spring" }}
              >
                <TouchableOpacity onPress={handleLogin} activeOpacity={0.85}>
                  <LinearGradient 
                    colors={["#0554F2", "#3098F2"]}
                    style={styles.button}
                  >
                    <Text style={styles.buttonText}>Login</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </MotiView>

              {/* Links */}
            <Link href="/recover" asChild>
              <MotiText 
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1000 }}
                style={styles.forgotPassword}
              >
                Forgot your password?
              </MotiText>
            </Link>
              <MotiView 
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1150 }}
                style={styles.registerContainer}
              >
                <Text style={styles.registerText}>Don’t have an account?</Text>
                <Link href="/register" asChild>
                  <TouchableOpacity>
                    <Text style={styles.registerLink}> Sign up</Text>
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
    fontSize: 28,
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
  forgotPassword: {
    color: "#0554F2",
    marginTop: 18,
    textAlign: "center",
    fontSize: 14,
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
  // Círculos decorativos
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
