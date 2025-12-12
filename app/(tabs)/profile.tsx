// app/(tabs)/profile.tsx
import { useAuth } from "@/src/hooks/useAuth";
import { followService } from "@/src/services/followService";
import { db } from "@/src/services/firebase";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";

type UserPost = {
  id: string;
  image?: string;      // your Firestore uses "image"
  imageUrl?: string;   // some parts of your app use "imageUrl"
  caption?: string;
  createdAt?: any;
  userId: string;
  username?: string;
};

const Profile = () => {
  const { user, logout, isLoading: authLoading } = useAuth();

  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ posts for this profile
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

  // ✅ quick full-screen preview
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadFollowStats();
      loadMyPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const loadFollowStats = async () => {
    if (!user) return;

    try {
      const [followers, following] = await Promise.all([
        followService.getFollowersCount(user.uid),
        followService.getFollowingCount(user.uid),
      ]);

      setFollowersCount(followers);
      setFollowingCount(following);
    } catch (error) {
      console.error("Error loading follow stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ fetch posts from /posts where userId == current user
  const loadMyPosts = async () => {
    if (!user) return;

    try {
      setPostsLoading(true);

      const postsRef = collection(db, "posts");
      const q = query(
        postsRef,
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const snap = await getDocs(q);

      const list: UserPost[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));

      setPosts(list);
    } catch (e) {
      console.error("Error loading user posts:", e);
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleFollowersPress = () => {
    router.push("/(protectedScreens)/followers");
  };

  const handleFollowingPress = () => {
    router.push("/(protectedScreens)/following");
  };

  const handleSignout = async () => {
    try {
      await logout();
      router.replace("/(authScreens)/sign-in");
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  const openPreview = (url: string) => {
    setPreviewUrl(url);
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewUrl(null);
  };

  const postsCount = useMemo(() => posts.length, [posts]);

  if (authLoading) {
    return (
      <View style={profileStyles.centered}>
        <ActivityIndicator size="large" color="#0095f6" />
        <Text style={profileStyles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={profileStyles.container}>
      {/* Header */}
      <View style={profileStyles.header}>
        <View style={profileStyles.profileInfo}>
          <Image
            source={{ uri: user?.image || "https://via.placeholder.com/80" }}
            style={profileStyles.avatar}
          />

          <Text style={profileStyles.username}>{user?.name || "User"}</Text>
          <Text style={profileStyles.email}>{user?.email}</Text>

          {/* Follow Stats */}
          <View style={profileStyles.statsContainer}>
            <TouchableOpacity
              style={profileStyles.stat}
              onPress={handleFollowersPress}
            >
              <Text style={profileStyles.statNumber}>
                {isLoading ? "-" : followersCount}
              </Text>
              <Text style={profileStyles.statLabel}>Followers</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={profileStyles.stat}
              onPress={handleFollowingPress}
            >
              <Text style={profileStyles.statNumber}>
                {isLoading ? "-" : followingCount}
              </Text>
              <Text style={profileStyles.statLabel}>Following</Text>
            </TouchableOpacity>

            <View style={profileStyles.stat}>
              <Text style={profileStyles.statNumber}>
                {postsLoading ? "-" : postsCount}
              </Text>
              <Text style={profileStyles.statLabel}>Posts</Text>
            </View>
          </View>

          {/* Refresh posts */}
          <Pressable onPress={loadMyPosts} style={profileStyles.refreshButton}>
            <Ionicons name="refresh" size={18} color="#0095f6" />
            <Text style={profileStyles.refreshText}>
              {postsLoading ? "Loading..." : "Refresh posts"}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ✅ Posts grid */}
      <View style={profileStyles.postsSection}>
        <Text style={profileStyles.postsTitle}>Posts</Text>

        {postsLoading ? (
          <View style={profileStyles.centeredSmall}>
            <ActivityIndicator size="small" color="#0095f6" />
            <Text style={profileStyles.loadingTextSmall}>Loading posts…</Text>
          </View>
        ) : posts.length === 0 ? (
          <Text style={profileStyles.emptyText}>No posts yet</Text>
        ) : (
          <View style={profileStyles.grid}>
            {posts.map((p) => {
              const url = (p.imageUrl || p.image) as string | undefined;

              // if missing URL, skip rendering
              if (!url) return null;

              return (
                <Pressable
                  key={p.id}
                  style={profileStyles.gridItem}
                  onPress={() => openPreview(url)}
                >
                  <Image source={{ uri: url }} style={profileStyles.gridImage} />
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      {/* Edit Profile Button */}
      <Pressable
        onPress={() => router.push("/(protectedScreens)/edit-profile")}
        style={profileStyles.section}
      >
        <View style={profileStyles.menuItem}>
          <Ionicons name="create-outline" size={24} color="#333" />
          <Text style={profileStyles.menuText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </View>
      </Pressable>

      {/* Settings Section */}
      <View style={profileStyles.section}>
        <Text style={profileStyles.sectionTitle}>Settings</Text>

        <Pressable style={profileStyles.menuItem}>
          <Ionicons name="notifications-outline" size={24} color="#333" />
          <Text style={profileStyles.menuText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </Pressable>

        <Pressable style={profileStyles.menuItem}>
          <Ionicons name="lock-closed-outline" size={24} color="#333" />
          <Text style={profileStyles.menuText}>Privacy</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </Pressable>

        <Pressable style={profileStyles.menuItem}>
          <Ionicons name="help-circle-outline" size={24} color="#333" />
          <Text style={profileStyles.menuText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </Pressable>

        <Pressable style={profileStyles.menuItem}>
          <Ionicons name="information-circle-outline" size={24} color="#333" />
          <Text style={profileStyles.menuText}>About</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </Pressable>
      </View>

      {/* Sign Out Button */}
      <Pressable onPress={handleSignout} style={profileStyles.signOutButton}>
        <Text style={profileStyles.signOutText}>Sign Out</Text>
      </Pressable>

      {/* Fullscreen preview */}
      <Modal visible={previewOpen} transparent animationType="fade">
        <Pressable style={profileStyles.previewBackdrop} onPress={closePreview}>
          <View style={profileStyles.previewCard}>
            {previewUrl ? (
              <Image
                source={{ uri: previewUrl }}
                style={profileStyles.previewImage}
              />
            ) : null}
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
};

export default Profile;

const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  header: {
    backgroundColor: "white",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  profileInfo: {
    alignItems: "center",
    paddingVertical: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e5e5e5",
    marginBottom: 12,
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 16,
  },
  stat: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#d9efff",
    backgroundColor: "#f4fbff",
  },
  refreshText: {
    marginLeft: 8,
    color: "#0095f6",
    fontWeight: "600",
  },

  postsSection: {
    backgroundColor: "white",
    marginTop: 12,
    padding: 12,
  },
  postsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  emptyText: {
    color: "#666",
    paddingVertical: 18,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  gridItem: {
    width: "32%",
    aspectRatio: 1,
    backgroundColor: "#eee",
    borderRadius: 8,
    overflow: "hidden",
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },

  section: {
    backgroundColor: "white",
    marginTop: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  menuText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  signOutButton: {
    backgroundColor: "white",
    marginTop: 12,
    padding: 16,
    alignItems: "center",
  },
  signOutText: {
    color: "red",
    fontSize: 16,
    fontWeight: "600",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  centeredSmall: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  loadingTextSmall: {
    marginTop: 8,
    color: "#666",
    fontSize: 12,
  },

  previewBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },
  previewCard: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#000",
    borderRadius: 12,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: 420,
  },
});
