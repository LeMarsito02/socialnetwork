// chat/_layout.tsx
import { MessageProvider } from "@/contexts/MessageContext";
import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function ChatLayout() {
  return (
    <MessageProvider>
      <View style={styles.container}>
        <Stack
          screenOptions={{
            headerShown: false, 
            animation: "slide_from_right",
          }}
        />
      </View>
    </MessageProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // 👈 color base para toda la carpeta
  },
});
