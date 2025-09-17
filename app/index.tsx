// app/index.tsx
import { useContext, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { AuthContext } from "@/contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";

export default function Index() {
  const router = useRouter();
  const { user, loading } = useContext(AuthContext);

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/(main)");
      } else {
        router.replace("/(auth)/login");
      }
    }
  }, [loading, user]);

  if (loading) {
    return (
      <LinearGradient colors={["#0554F2", "#3098F2"]} style={styles.container}>
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 1000 }}
          style={styles.logoContainer}
        >
          <Text style={styles.logo}>LeMarTek</Text>
          <Text style={styles.subtitle}>Cloud for Students 🚀</Text>
        </MotiView>
      </LinearGradient>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  logoContainer: { alignItems: "center" },
  logo: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  subtitle: { fontSize: 16, color: "#f0f0f0" },
});
