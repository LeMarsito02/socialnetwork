import { View, Text, StyleSheet, FlatList, Image, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const reelsData = [
  { id: "1", uri: "https://placekitten.com/400/700", title: "Gatito 1" },
  { id: "2", uri: "https://placekitten.com/401/701", title: "Gatito 2" },
  { id: "3", uri: "https://placekitten.com/402/702", title: "Gatito 3" },
  { id: "4", uri: "https://placekitten.com/403/703", title: "Gatito 4" },
  { id: "5", uri: "https://placekitten.com/404/704", title: "Gatito 5" },
];

export default function ReelsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>🎥 Reels</Text>

      <FlatList
        data={reelsData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.reelCard}>
            <Image source={{ uri: item.uri }} style={styles.reelImage} />
            <Text style={styles.reelTitle}>{item.title}</Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        pagingEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 12,
  },
  reelCard: {
    width,
    height: Dimensions.get("window").height * 0.8, // casi pantalla completa
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  reelImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 12,
  },
  reelTitle: {
    position: "absolute",
    bottom: 20,
    left: 20,
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
