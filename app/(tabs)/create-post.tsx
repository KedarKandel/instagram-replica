// app/(tabs)/create-post.tsx
import { useAuth } from "@/src/hooks/useAuth";
import { postService } from "@/src/services/postService";
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

export default function CreatePostScreen() {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { user, isAuthenticated } = useAuth();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleCreatePost = async () => {
    if (!image) {
      Alert.alert("Add Photo", "Please add a photo to create a post");
      return;
    }

    if (!user || !isAuthenticated) {
      Alert.alert("Error", "You must be logged in to create a post");
      return;
    }

    setIsLoading(true);
    try {
      // For now, use local URI - you can add Firebase Storage later
      await postService.createPost(
        {
          caption: caption.trim(),
          imageUrl: image,
          location: location.trim(),
        },
        user
      );

      // Reset and navigate
      setCaption("");
      setImage(null);
      setLocation("");
      router.replace({
        pathname: "/(tabs)/feed",
        params: { refresh: Date.now() }, // Add timestamp to force refresh
      });
    } catch (error) {
      Alert.alert("Error", "Failed to create post");
    } finally {
      setIsLoading(false);
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
        Create Post
      </Text>

      {/* Image Upload */}
      <TouchableOpacity
        onPress={pickImage}
        style={{ alignItems: "center", marginBottom: 20 }}
      >
        {image ? (
          <Image
            source={{ uri: image }}
            style={{ width: 200, height: 200, borderRadius: 8 }}
          />
        ) : (
          <View
            style={{
              alignItems: "center",
              padding: 40,
              borderWidth: 2,
              borderColor: "#e5e5e5",
              borderStyle: "dashed",
              borderRadius: 8,
            }}
          >
            <Ionicons name="camera-outline" size={60} color="#ccc" />
            <Text style={{ color: "#666", marginTop: 8 }}>
              Tap to add photo
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Caption */}
      <TextInput
        placeholder="Write a caption..."
        value={caption}
        onChangeText={setCaption}
        multiline
        style={{
          borderWidth: 1,
          borderColor: "#ddd",
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          minHeight: 80,
          textAlignVertical: "top",
        }}
      />

      {/* Location */}
      <TextInput
        placeholder="Add location (optional)"
        value={location}
        onChangeText={setLocation}
        style={{
          borderWidth: 1,
          borderColor: "#ddd",
          borderRadius: 8,
          padding: 12,
          marginBottom: 20,
        }}
      />

      {/* Create Button */}
      <TouchableOpacity
        onPress={handleCreatePost}
        disabled={isLoading || !image}
        style={{
          backgroundColor: isLoading || !image ? "#ccc" : "#0095f6",
          padding: 16,
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
            Share Post
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
