import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Instagram</Text>
      <Text style={styles.subtitle}>Welcome to your community</Text>

      <View style={styles.buttonContainer}>
        <Link href="/(authScreens)/sign-in" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Sign In</Text>
          </Pressable>
        </Link>

        <Link href="/(authScreens)/sign-up" asChild>
          <Pressable style={styles.outlineButton}>
            <Text style={[styles.buttonText, styles.outlineButtonText]}>
              Sign Up
            </Text>
          </Pressable>
        </Link>
      </View>

      <Text style={styles.footerText}>© 2025 Instagram Clone</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#bf375bff", // Instagram pinkish gradient base color
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    color: "#fff",
    opacity: 0.9,
    marginBottom: 50,
  },
  buttonContainer: {
    width: "80%",
    gap: 14,
  },
  button: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: "#fff",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  outlineButtonText: {
    color: "#fff",
  },
  footerText: {
    position: "absolute",
    bottom: 40,
    color: "#fff",
    opacity: 0.7,
    fontSize: 13,
  },
});
