// app/index.tsx
import { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { AuthContext } from "@/contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import LottieView from "lottie-react-native";

const { width } = Dimensions.get("window");

export default function Index() {
  const router = useRouter();
  const { user, loading } = useContext(AuthContext);
  const [showSplash, setShowSplash] = useState(true); // 👈 Nuevo estado

  useEffect(() => {
    if (!loading) {
      // Espera 3 segundos antes de redirigir
      const timeout = setTimeout(() => {
        if (user) {
          router.replace("/(main)");
        } else {
          router.replace("/(auth)/login");
        }

        // Retraso adicional leve antes de ocultar el splash (evita pantalla negra)
        setTimeout(() => setShowSplash(false), 300);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [loading, user]);

  if (showSplash) {
    return (
      <LinearGradient colors={["#0554F2", "#3098F2"]} style={styles.container}>
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 1000 }}
          style={styles.logoContainer}
        >
          <LottieView
            source={require("@/assets/animations/cloud_loading.json")}
            autoPlay
            loop
            style={styles.lottie}
          />

          <Text style={styles.logo}>StudentHUb</Text>
          <Text style={styles.subtitle}>By LeMarTek</Text>
        </MotiView>
      </LinearGradient>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  logoContainer: { 
    alignItems: "center" 
  },
  logo: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
  },
  subtitle: { 
    fontSize: 16, 
    color: "#f0f0f0",
    marginTop: 5,
  },
  lottie: {
    width: width * 0.5,
    height: width * 0.5,
  },
});
