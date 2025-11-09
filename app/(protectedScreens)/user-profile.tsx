// app/(protected)/user-profile.tsx
import { FollowButton } from '@/src/components/FollowButton';
import { followService } from '@/src/services/followService';
import { postService } from '@/src/services/postService';
import { Post } from '@/src/types/posts';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function UserProfileScreen() {
  const { userId, username } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [postsCount, setPostsCount] = useState(0);

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      
      const [followers, following, posts] = await Promise.all([
        followService.getFollowersCount(userId as string),
        followService.getFollowingCount(userId as string),
        postService.getPostsByUserId(userId as string)
      ]);
      
      setFollowersCount(followers);
      setFollowingCount(following);
      setUserPosts(posts);
      setPostsCount(posts.length);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostPress = (post: Post) => {
    // extra if we need to handle each post but i don't want to expand further.
  };

  const renderPostItem = ({ item }: { item: Post }) => (
    <TouchableOpacity 
      onPress={() => handlePostPress(item)}
      style={styles.postItem}
    >
      <Image 
        source={{ uri: item.imageUrl }} 
        style={styles.postImage}
        resizeMode="cover"
      />
      
      {/* Post overlay with likes and comments */}
      <View style={styles.postOverlay}>
        <View style={styles.postStats}>
          <Ionicons name="heart" size={16} color="white" />
          <Text style={styles.postStatText}>{item.likes.length}</Text>
        </View>
        <View style={styles.postStats}>
          <Ionicons name="chatbubble" size={16} color="white" />
          <Text style={styles.postStatText}>{item.comments.length}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/100' }} 
            style={styles.avatar}
          />
          <Text style={styles.username}>{username}</Text>
          
          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>
                {isLoading ? '-' : postsCount}
              </Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>
                {isLoading ? '-' : followersCount}
              </Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>
                {isLoading ? '-' : followingCount}
              </Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>

          {/* Follow Button */}
          <FollowButton 
            targetUserId={userId as string}
            onFollowChange={() => {
              // Refresh stats when follow status changes
              loadUserData();
            }}
          />
        </View>

        {/* User's Posts Section */}
        <View style={styles.postsSection}>
          <Text style={styles.sectionTitle}>Posts</Text>
          
          {userPosts.length > 0 ? (
            <FlatList
              data={userPosts}
              renderItem={renderPostItem}
              keyExtractor={item => item.id}
              numColumns={3}
              scrollEnabled={false}
              contentContainerStyle={styles.postsGrid}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.noPostsContainer}>
              <Ionicons name="camera-outline" size={60} color="#ccc" />
              <Text style={styles.noPostsText}>No posts yet</Text>
              <Text style={styles.noPostsSubtext}>
                When {username} shares photos and videos, you'll see them here.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  profileInfo: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  postsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  postsGrid: {
    padding: 1,
  },
  postItem: {
    flex: 1,
    aspectRatio: 1,
    margin: 1,
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
  },
  postOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  postStatText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
  noPostsContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noPostsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  noPostsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});