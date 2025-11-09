
import { PostCard } from '@/src/components/PostCard';
import { useAuth } from '@/src/hooks/useAuth';
import { postService } from '@/src/services/postService';
import { Post } from '@/src/types/posts';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native';

export default function FeedScreen() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    loadPosts();
  }, [refresh]);

  const loadPosts = async () => {
    try {
      const postsData = await postService.getPosts();
      setPosts(postsData);
    } catch (error) {
      console.error('Error loading posts:', error);
      Alert.alert('Error', 'Failed to load posts');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadPosts();
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to like posts');
      return;
    }

    try {
      // Update UI optimistically first
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            const isLiked = post.likes.includes(user.uid);
            return {
              ...post,
              likes: isLiked 
                ? post.likes.filter(id => id !== user.uid)
                : [...post.likes, user.uid]
            };
          }
          return post;
        })
      );

      // Then call Firebase service
      await postService.toggleLike(postId, user.uid);
      
    } catch (error: any) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', error.message || 'Failed to toggle like');
      loadPosts(); // Reload to get correct state
    }
  };

  const handleAddComment = async (postId: string, text: string) => {
    if (!text.trim() || !user) {
      return;
    }

    try {
      // Create optimistic comment (matching Comment interface)
      const optimisticComment = {
        id: `temp-${Date.now()}`,
        userId: user.uid,
        username: user.name,
        text: text.trim(),
        createdAt: new Date(),
      };

      // Update UI optimistically
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: [...post.comments, optimisticComment]
            };
          }
          return post;
        })
      );

      // Clear comment input
      setCommentText('');
      setActiveCommentPost(null);

      // call firebase service
      await postService.addComment(postId, text, user);
      
      // Reload to get the actual comment with proper ID
      await loadPosts();
      
    } catch (error: any) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', error.message || 'Failed to add comment');
      loadPosts(); // Reload to get correct state
    }
  };

  const onAddComment = async (postId: string, text: string) => {
    if (!user || !text.trim()) return;
    await postService.addComment(postId, {
      authorId: user.uid,
      username: user.name || "user",
      text: text.trim(),
    });
    setCommentText("");
  };



  const handleUserPress = (userId: string, username: string) => {
  // Navigate to the user's profile screen
  router.push({
    pathname: '/(protectedScreens)/user-profile',
    params: { 
      userId: userId,
      username: username 
    }
  });
};

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0095f6" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading posts...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={posts}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={onLike}
            onAddComment={onAddComment}
            activeCommentPost={activeCommentPost}
            onToggleComment={onToggleComment}
            commentText={commentText}
            onCommentTextChange={setCommentText}
            onUserPress={handleUserPress}
          />
        )}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#0095f6']}
          />
        }
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#666', textAlign: 'center' }}>
              No posts yet
            </Text>
            <Text style={{ fontSize: 14, color: '#999', marginTop: 8, textAlign: 'center' }}>
              Be the first to share a post!
            </Text>
          </View>
        }
      />
    </View>
  );
}
