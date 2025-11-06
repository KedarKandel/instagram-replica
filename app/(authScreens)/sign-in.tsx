import { FormInput } from "@/src/components/FormInput";
import { useAuth } from "@/src/hooks/useAuth";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formErrors, setFormErrors] = useState({
    email: "",
    password: "",
  });
  const { signIn, isLoading, error, clearError } = useAuth();

  const handleSignIn = async () => {
    // Basic form validation
    const errors = {
      email: "",
      password: "",
    };

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email is invalid";
    }

    if (!password) {
      errors.password = "Password is required";
    }

    setFormErrors(errors);

    // If no errors, proceed with sign in
    if (!errors.email && !errors.password) {
      try {
        await signIn(email, password);
        router.replace("/(tabs)/feed");
      } catch (err) {
        console.log("Sign in error:", err);
      }
    }
  };

  // Clear errors when user starts typing
  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (formErrors.email) {
      setFormErrors((prev) => ({ ...prev, email: "" }));
    }
    if (error) clearError();
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (formErrors.password) {
      setFormErrors((prev) => ({ ...prev, password: "" }));
    }
    if (error) clearError();
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          marginBottom: 30,
          textAlign: "center",
        }}
      >
        Sign In
      </Text>

      {/* Auth error message */}
      {error && (
        <Text style={{ color: "red", textAlign: "center", marginBottom: 10 }}>
          {error}
        </Text>
      )}

      <View style={{ gap: 16 }}>
        {/* Replace TextInput with FormInput components */}
        <FormInput
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={handleEmailChange}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          editable={!isLoading}
          error={formErrors.email}
        />

        <FormInput
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={handlePasswordChange}
          secureTextEntry
          autoComplete="password"
          editable={!isLoading}
          error={formErrors.password}
        />

        <TouchableOpacity
          onPress={handleSignIn}
          disabled={isLoading}
          style={{
            backgroundColor: isLoading ? "#ccc" : "#0095f6",
            padding: 15,
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>
            {isLoading ? "Signing In..." : "Sign In"}
          </Text>
        </TouchableOpacity>
      </View>
      <Link href="/(authScreens)/sign-up" asChild>
        <TouchableOpacity style={{ marginTop: 15, alignItems: "center" }}>
          <Text style={{ color: "#0095f6" }}>
            Don't have an account? Sign Up
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
