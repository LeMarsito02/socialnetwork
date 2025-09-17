import React from "react";
import { View, Text, StyleSheet, FlatList, SafeAreaView } from "react-native";

const services = [
  { id: "1", name: "Database", status: "Activo", users: 120 },
  { id: "2", name: "API Gateway", status: "Activo", users: 45 },
  { id: "3", name: "Auth Service", status: "Inactivo", users: 0 },
  { id: "4", name: "Storage", status: "Activo", users: 300 },
];

export default function CloudDashboard() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>☁️ LeMarTek Cloud</Text>
        <View style={styles.userInfo}>
          <Text style={styles.username}>LeMarTek</Text>
          <Text style={styles.plan}>Plan: Premium</Text>
        </View>
      </View>

      {/* Métricas */}
      <View style={styles.metricsContainer}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>RAM</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "65%", backgroundColor: "#3b82f6" }]} />
          </View>
          <Text style={styles.metricValue}>6.5 GB / 10 GB</Text>
        </View>

        <View style={styles.metric}>
          <Text style={styles.metricLabel}>CPU</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "40%", backgroundColor: "#facc15" }]} />
          </View>
          <Text style={styles.metricValue}>40%</Text>
        </View>

        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Servicios activos</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "75%", backgroundColor: "#22c55e" }]} />
          </View>
          <Text style={styles.metricValue}>3 / 4</Text>
        </View>
      </View>

      {/* Lista de servicios */}
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.cardsContainer}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text>
              Estado:{" "}
              <Text
                style={{
                  color: item.status === "Activo" ? "#22c55e" : "#ef4444",
                  fontWeight: "bold",
                }}
              >
                {item.status}
              </Text>
            </Text>
            <Text>Usuarios activos: {item.users}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f9",
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  logo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0554F2",
  },
  userInfo: {
    alignItems: "flex-end",
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
  },
  plan: {
    fontSize: 14,
    color: "#555",
  },
  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
  },
  metric: {
    flex: 1,
    marginHorizontal: 6,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  progressBar: {
    height: 10,
    backgroundColor: "#e5e7eb",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
  },
  metricValue: {
    fontSize: 12,
    color: "#555",
    marginTop: 4,
  },
  cardsContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 6,
    color: "#111",
  },
});
