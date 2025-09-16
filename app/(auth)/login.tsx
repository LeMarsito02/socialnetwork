import { 
  Text, 
  View, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform 
} from "react-native";
import { Link, useRouter } from "expo-router";  // 👈 importa el hook correcto

export default function EntryPoint() {
  const router = useRouter(); // 👈 inicializa router

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >          
        <View style={styles.main}>
          {/* Caja principal */}
          <View style={styles.card}>
            {/* Decoración superior */}
            <View style={[styles.circle, styles.topCircle]} />
            <View style={[styles.circle, styles.topCircle2]} />

            {/* Decoración inferior */}
            <View style={[styles.circle, styles.bottomCircle]} />
            <View style={[styles.circle, styles.bottomCircle2]} />

            {/* Contenido */}
            <Text style={styles.title}>Welcome to{"\n"}StudentHub by LeMarTek</Text>
            <Text style={styles.subtitle}>Hey! Sign in with your LeMarTek student account</Text>

            {/* Inputs */}
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#888"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#888"
              secureTextEntry
            />
            {/* Botón de login */}
            <Link href="/(main)" asChild>
                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>
            </Link>
            {/* Links */}
            <TouchableOpacity>
              <Text style={styles.forgotPassword}>Forgot your password?</Text>
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don’t have an account?</Text>
              <TouchableOpacity>
                <Text style={styles.registerLink}> Sign up</Text>
              </TouchableOpacity>

            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  main: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  card: {
    flex: 1,
    width: "100%",
    backgroundColor: "#fff",
    padding: 30,
    overflow: "hidden",
    position: "relative",
  },
  circle: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#0554F2",
  },
  topCircle: {
    top: -80,
    right: -80,
    opacity: 0.9,
  },
  topCircle2: {
    top: -65,
    right: -65,
    opacity: 0.6,
    backgroundColor: "#3098F2",
  },
  bottomCircle: {
    bottom: -80,
    left: -80,
    opacity: 0.9,
  },
  bottomCircle2: {
    bottom: -80,
    left: -60,
    opacity: 0.6,
    backgroundColor: "#3098F2",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginTop: 15,
    backgroundColor: "#f9f9f9",
    fontSize: 16,
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#0554F2",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  forgotPassword: {
    color: "#0554F2",
    marginTop: 15,
    textAlign: "center",
    fontSize: 14,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
    flexWrap: "wrap",
  },
  registerText: {
    fontSize: 14,
    color: "#555",
  },
  registerLink: {
    fontSize: 14,
    color: "#0554F2",
    fontWeight: "bold",
  },
});
