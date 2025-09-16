import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from "react-native";
import { Heart, MessageCircle, Send } from "lucide-react-native"; 
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";  // ✅ importa router

const posts = [
  {
    id: "1",
    user: "LeMarTek",
    avatar: "https://placekitten.com/100/100",
    image: "https://placekitten.com/600/800",
    caption: "🚀 Innovando en tecnología con un café ☕ en mano.",
  },
  {
    id: "2",
    user: "CoderGirl",
    avatar: "https://placekitten.com/101/101",
    image: "https://placekitten.com/601/801",
    caption: "💻 Cuando el bug se arregla a las 3am.",
  },
  {
    id: "3",
    user: "GamerPro",
    avatar: "https://placekitten.com/102/102",
    image: "https://placekitten.com/602/802",
    caption: "🎮 Gaming night con los panas.",
  },
];

export default function HomeScreen() {
  const router = useRouter(); // ✅ ahora sí dentro del componente

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>StudentHub</Text>
        <View style={styles.headerIcons}>
          <Heart size={24} color="#000" style={styles.icon} />
          <TouchableOpacity onPress={() => router.push("/(main)/messages")}>
            <Send size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Feed */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            {/* User Info */}
            <View style={styles.postHeader}>
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
              <Text style={styles.username}>{item.user}</Text>
            </View>

            {/* Post Image */}
            <Image source={{ uri: item.image }} style={styles.postImage} />

            {/* Post Actions */}
            <View style={styles.actions}>
              <TouchableOpacity>
                <Heart size={22} color="#e63946" />
              </TouchableOpacity>
              <TouchableOpacity>
                <MessageCircle size={22} color="#000" style={{ marginLeft: 12 }} />
              </TouchableOpacity>
              <TouchableOpacity>
                <Send size={22} color="#000" style={{ marginLeft: 12 }} />
              </TouchableOpacity>
            </View>

            {/* Caption */}
            <Text style={styles.caption}>
              <Text style={styles.username}>{item.user} </Text>
              {item.caption}
            </Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  logo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0554F2",
  },
  headerIcons: {
    flexDirection: "row",
  },
  icon: {
    marginLeft: 16,
  },
  postCard: {
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  username: {
    fontWeight: "bold",
    fontSize: 14,
  },
  postImage: {
    width: "100%",
    height: 350,
  },
  actions: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  caption: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    fontSize: 14,
    color: "#333",
  },
});
