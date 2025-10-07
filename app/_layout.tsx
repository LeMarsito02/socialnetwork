import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import { AuthProvider } from "@/contexts/AuthContext";
import {PostProvider} from "@/contexts/PostContext";
export default function RootLayout() {
  // Detecta si el sistema está en dark/light
  const colorScheme = useColorScheme();

  // Carga de fuentes (puedes agregar más si quieres)
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    return null; // Evita que la UI cargue sin fuentes
  }

  return (
    <AuthProvider>
      <PostProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <Stack screenOptions={{ headerShown: false }}>
          {/* Grupo de autenticación */}
          <Stack.Screen name="(auth)" />

          {/* Grupo principal con Tabs */}
          <Stack.Screen name="(main)" />

          {/* Pantalla fallback si la ruta no existe */}
          <Stack.Screen name="+not-found" />

                    {/* Grupo principal con Tabs */}
          <Stack.Screen name="chat" />

        </Stack>
      </ThemeProvider>
      </PostProvider>
    </AuthProvider>

  );
}
