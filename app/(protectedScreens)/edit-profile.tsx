import { useAuth } from "@/src/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditProfile() {
  const { user, isAuthenticated, updateUserProfile, isLoading } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [newImage, setNewImage] = useState<string | null>(user?.image ?? null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      aspect: [1, 1], // Square pic
      quality: 1,
    });

    if (!result.canceled) {
      setNewImage(result.assets[0].uri);
    }
  };

  const imageToUse = newImage || user?.image;

  const onSave = async () => {
    if (!user || !isAuthenticated) {
      Alert.alert("Error", "You must be logged in to update your profile");
      return;
    }

    if (!name.trim()) {
      Alert.alert("Error", "Display name is required");
      return;
    }

    try {
      await updateUserProfile(name.trim(), imageToUse as string);

      Alert.alert("Success", "Profile updated successfully");
      router.navigate({
        pathname: "/(tabs)/profile",
        params: { refresh: Date.now() },
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", error.message || "Failed to update profile");
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "white" }}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        Edit Profile
      </Text>

      {/* Profile Image Picker */}
      <TouchableOpacity
        onPress={pickImage}
        style={{ alignItems: "center", marginBottom: 20 }}
      >
        {imageToUse ? (
          <View style={{ position: "relative" }}>
            <Image
              source={{ uri: imageToUse }}
              style={{ width: 150, height: 150, borderRadius: 75 }}
            />
            {/* Edit Icon Overlay */}
            <View
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                backgroundColor: "#0095f6",
                borderRadius: 15,
                padding: 6,
                borderWidth: 2,
                borderColor: "white",
              }}
            >
              <Ionicons name="camera" size={16} color="white" />
            </View>
          </View>
        ) : (
          <View
            style={{
              alignItems: "center",
              padding: 40,
              borderWidth: 2,
              borderColor: "#e5e5e5",
              borderStyle: "dashed",
              borderRadius: 75,
            }}
          >
            <Ionicons name="person-outline" size={60} color="#ccc" />
            <Text style={{ color: "#666", marginTop: 8 }}>
              Tap to add photo
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Display Name */}
      <Text style={{ fontSize: 16, fontWeight: "500", marginBottom: 6 }}>
        Display Name
      </Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Your name"
        style={{
          borderWidth: 1,
          borderColor: "#ddd",
          borderRadius: 8,
          padding: 12,
          marginBottom: 20,
          fontSize: 16,
        }}
      />

      {/* Save Button  */}
      <TouchableOpacity
        onPress={onSave}
        disabled={isLoading || !name.trim()}
        style={{
          backgroundColor: isLoading || !name.trim() ? "#ccc" : "#0095f6",
          padding: 16,
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
            Save Changes
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
