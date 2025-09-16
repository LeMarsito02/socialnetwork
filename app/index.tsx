import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 👈 controla login real después

  useEffect(() => {
    // Simula chequeo de sesión
    setTimeout(() => {
      if (isLoggedIn) {
        router.replace("/(main)"); // 👈 apunta a index dentro de (main)
      } else {
        router.replace("/(auth)/login"); // 👈 apunta al login en (auth)
      }
      setLoading(false);
    }, 1500);
  }, [isLoggedIn]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0554F2" />
      </View>
    );
  }

  return null;
}
