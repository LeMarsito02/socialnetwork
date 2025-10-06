import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import { Home, Video, PlusCircle, Cloud, User, MessageCircle } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "#0554F2",
        tabBarInactiveTintColor: "#999",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reels"
        options={{
          title: "Reels",
          tabBarIcon: ({ color }) => <Video size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="newpost"
        options={{
          title: "Nuevo",
          tabBarIcon: ({ color }) => (
            <View style={styles.addButton}>
              <PlusCircle size={28} color="#fff" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="cloud"
        options={{
          title: "Cloud",
          tabBarIcon: ({ color }) => <Cloud size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />
            <Tabs.Screen
        name="editprofile"
        options={{
          title: "Editar Perfil",
          tabBarIcon: ({ color }) => <MessageCircle size={22} color={color} />,
          href: null, // se oculta del tab
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    elevation: 5,
    backgroundColor: "#fff",
    borderRadius: 25,
    height: 65,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
  },
  addButton: {
    backgroundColor: "#0554F2",
    borderRadius: 50,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10, // sobresale un poco
  },
});
