import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity 
} from "react-native";
import { Heart, MessageCircle, Send } from "lucide-react-native"; 
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MotiView } from "moti";

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
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>StudentHub</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity activeOpacity={0.7}>
            <Heart size={24} color="#000" style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => router.push("/(main)/messages")} 
            activeOpacity={0.7}
          >
            <Send size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Feed */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <MotiView
            from={{ opacity: 0, translateY: 40 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: index * 200, type: "timing" }}
            style={styles.postCard}
          >
            {/* User Info */}
            <View style={styles.postHeader}>
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
              <Text style={styles.username}>{item.user}</Text>
            </View>

            {/* Post Image */}
            <Image source={{ uri: item.image }} style={styles.postImage} />

            {/* Post Actions */}
            <View style={styles.actions}>
              <TouchableOpacity activeOpacity={0.6}>
                <Heart size={22} color="#e63946" />
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.6}>
                <MessageCircle size={22} color="#000" style={{ marginLeft: 14 }} />
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.6}>
                <Send size={22} color="#000" style={{ marginLeft: 14 }} />
              </TouchableOpacity>
            </View>

            {/* Caption */}
            <Text style={styles.caption}>
              <Text style={styles.username}>{item.user} </Text>
              {item.caption}
            </Text>
          </MotiView>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
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
    marginRight: 18,
  },
  postCard: {
    backgroundColor: "#fff",
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },
  username: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#111",
  },
  postImage: {
    width: "100%",
    height: 360,
    resizeMode: "cover",
  },
  actions: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  caption: {
    paddingHorizontal: 12,
    paddingBottom: 14,
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
});
