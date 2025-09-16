import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

const chats = [
  {
    id: "1",
    user: "María",
    avatar: "https://i.pravatar.cc/100?img=5",
    lastMessage: "¿Cómo estás? 💬",
    time: "12:45",
  },
  {
    id: "2",
    user: "Andrés",
    avatar: "https://i.pravatar.cc/100?img=6",
    lastMessage: "Nos vemos mañana 👌",
    time: "11:30",
  },
  {
    id: "3",
    user: "Laura",
    avatar: "https://i.pravatar.cc/100?img=7",
    lastMessage: "Me encantó la foto 🔥",
    time: "10:10",
  },
  {
    id: "4",
    user: "Carlos",
    avatar: "https://i.pravatar.cc/100?img=8",
    lastMessage: "Te mando el link",
    time: "09:22",
  },
];

export default function MessagesScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mensajes</Text>
        <TouchableOpacity>
          <Text style={styles.newMsg}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Chat List */}
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.chatItem}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.chatInfo}>
              <Text style={styles.username}>{item.user}</Text>
              <Text style={styles.lastMessage} numberOfLines={1}>
                {item.lastMessage}
              </Text>
            </View>
            <Text style={styles.time}>{item.time}</Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  newMsg: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#0554F2",
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
  },
  username: {
    fontWeight: "bold",
    fontSize: 16,
  },
  lastMessage: {
    color: "#555",
    fontSize: 14,
    marginTop: 2,
  },
  time: {
    fontSize: 12,
    color: "#999",
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
    marginLeft: 78,
  },
});
