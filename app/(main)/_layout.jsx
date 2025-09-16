import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0554F2",
        tabBarInactiveTintColor: "#999",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: () => <Text>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="reels"
        options={{
          title: "Reels",
          tabBarIcon: () => <Text>📹</Text>,
        }}
      />      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: () => <Text>📹</Text>,
          href: null,
        }}
      />
    <Tabs.Screen
        name="newpost"
        options={{
          title: "New",
          tabBarIcon: () => <Text>➕</Text>,
        }}
      />
    <Tabs.Screen
        name="cloud"
        options={{
          title: "Cloud",
          tabBarIcon: () => <Text>☁️</Text>,
        }}
      />
    <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: () => <Text>👤</Text>,
        }}
      />
    </Tabs>
    
    
  );
}
