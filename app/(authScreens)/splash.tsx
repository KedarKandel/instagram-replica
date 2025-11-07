import { getFirebaseAuth } from "@/src/services/firebase";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function SplashScreen() {
  // get auth 
  const auth = getFirebaseAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // made a custom delay for splash effect
      setTimeout(() => {
        if (user) {
          router.replace("/(tabs)/feed");
        } else {
          router.replace("/(authScreens)/welcome");
        }
        setLoading(false);
      }, 3000);
    });

    return unsubscribe;
  }, []);

if (loading) {
  return (
    <View style={styles.container}>
      <Text style={styles.logoText}>Instagram Clone</Text>
      <ActivityIndicator size="large" color="#feda75" style={{ marginTop: 20 }} />
    </View>
  );
}

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d62976', // Instagram gradient base (warm pink)
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
});
