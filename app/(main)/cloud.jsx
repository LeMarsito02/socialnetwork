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
        <Text style={styles.logo}>LeMarTek CloudMonitor</Text>
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
            <View style={[styles.progressFill, { width: "65%" }]} />
          </View>
          <Text style={styles.metricValue}>6.5 GB / 10 GB</Text>
        </View>

        <View style={styles.metric}>
          <Text style={styles.metricLabel}>CPU</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "40%" }]} />
          </View>
          <Text style={styles.metricValue}>40%</Text>
        </View>

        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Servicios activos</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "75%" }]} />
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
            <Text>Status: <Text style={{ color: item.status === "Activo" ? "green" : "red" }}>{item.status}</Text></Text>
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
    backgroundColor: "#f5f7fa",
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  logo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0554F2",
    paddingLeft : 4
  },
  userInfo: {
    alignItems: "flex-end",
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
    paddingRight :4,

  },
  plan: {
    fontSize: 14,
    color: "#555",
    paddingRight :4,
  },
  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
  },
  metric: {
    flex: 1,
    marginHorizontal: 4,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  progressBar: {
    height: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#0554F2",
  },
  metricValue: {
    fontSize: 12,
    color: "#555",
    marginTop: 2,
  },
  cardsContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
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
  },
});
