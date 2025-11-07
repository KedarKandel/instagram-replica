// app/(tabs)/feed.tsx
import { PostCard } from '@/src/components/PostCard';
import { useAuth } from '@/src/hooks/useAuth';
import { postService } from '@/src/services/postService';
import { Post } from '@/src/types/posts';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
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
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { refresh } = useLocalSearchParams();

  useEffect(() => {
    loadPosts();
  }, [refresh]);

  const loadPosts = async () => {
    try {
      const postsData = await postService.getPosts();
      setPosts(postsData);
    } catch (error) {
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

  const handleLike = (postId: string) => {
    if (!user) return;

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
  };

  const handleAddComment = (postId: string, text: string) => {
    if (!text.trim() || !user) return;

    const newComment = {
      id: Date.now().toString(),
      userId: user.uid,
      username: user.name || 'User',
      text: text,
      createdAt: new Date(),
    };

    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, newComment]
          };
        }
        return post;
      })
    );

    setCommentText('');
    setActiveCommentPost(null);
  };

  const handleToggleComment = (postId: string) => {
    setActiveCommentPost(activeCommentPost === postId ? null : postId);
    setCommentText('');
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
    <View style={{ flex: 1, backgroundColor: '#fafafa' }}>
      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={handleLike}
            onAddComment={handleAddComment}
            activeCommentPost={activeCommentPost}
            onToggleComment={handleToggleComment}
            commentText={commentText}
            onCommentTextChange={setCommentText}
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
            <Ionicons name="camera-outline" size={80} color="#ccc" />
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#666', marginTop: 16 }}>
              No posts yet
            </Text>
            <Text style={{ fontSize: 14, color: '#999', marginTop: 8 }}>
              Be the first to share a post!
            </Text>
          </View>
        }
      />
    </View>
  );
}