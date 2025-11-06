// app/(tabs)/feed.tsx
import { useAuth } from '@/src/hooks/useAuth';
import { postService } from '@/src/services/postService';
import { Post } from '@/src/types/posts';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';


export default function FeedScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;

    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          const isLiked = post.likes.includes(user.uid);
          return {
            ...post,
            likes: isLiked 
              ? post.likes.filter((id:string) => id !== user.uid)
              : [...post.likes, user.uid]
          };
        }
        return post;
      })
    );
  };

  const handleAddComment = async (postId: string) => {
    if (!commentText.trim() || !user) return;

    const newComment = {
      id: Date.now().toString(),
      userId: user.uid,
      username: user.name,
      text: commentText,
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

  const renderPost = ({ item }: { item: Post }) => (
    <View style={{ backgroundColor: 'white', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e5e5e5' }}>
      {/* Post Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }}>
        <Image 
          source={{ uri: item.userAvatar || 'https://via.placeholder.com/40' }} 
          style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }} 
        />
        <View>
          <Text style={{ fontWeight: '600' }}>{item.username}</Text>
          {item.location && <Text style={{ fontSize: 12, color: '#666' }}>{item.location}</Text>}
        </View>
      </View>

      {/* Post Image */}
      <Image 
        source={{ uri: item.imageUrl }} 
        style={{ width: '100%', height: 300 }} 
      />

      {/* Post Actions */}
      <View style={{ padding: 12 }}>
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          <TouchableOpacity onPress={() => handleLike(item.id)} style={{ marginRight: 16 }}>
            <Ionicons 
              name={item.likes.includes(user?.uid || '') ? "heart" : "heart-outline"} 
              size={24} 
              color={item.likes.includes(user?.uid || '') ? "red" : "black"} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveCommentPost(activeCommentPost === item.id ? null : item.id)}>
            <Ionicons name="chatbubble-outline" size={24} />
          </TouchableOpacity>
        </View>

        {/* Likes */}
        {item.likes.length > 0 && (
          <Text style={{ fontWeight: '600', marginBottom: 4 }}>
            {item.likes.length} {item.likes.length === 1 ? 'like' : 'likes'}
          </Text>
        )}

        {/* Caption */}
        <Text style={{ marginBottom: 4 }}>
          <Text style={{ fontWeight: '600' }}>{item.username}</Text> {item.caption}
        </Text>

        {/* Comments */}
        {item.comments.slice(0, 2).map(comment => (
          <Text key={comment.id} style={{ marginBottom: 2 }}>
            <Text style={{ fontWeight: '600' }}>{comment.username}</Text> {comment.text}
          </Text>
        ))}

        {item.comments.length > 2 && (
          <Text style={{ color: '#666', marginBottom: 4 }}>
            View all {item.comments.length} comments
          </Text>
        )}

        {/* Add Comment */}
        {activeCommentPost === item.id && (
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            <TextInput
              placeholder="Add a comment..."
              value={commentText}
              onChangeText={setCommentText}
              style={{ 
                flex: 1, 
                borderWidth: 1, 
                borderColor: '#ddd', 
                borderRadius: 20, 
                paddingHorizontal: 12,
                paddingVertical: 8,
                marginRight: 8
              }}
            />
            <TouchableOpacity 
              onPress={() => handleAddComment(item.id)}
              disabled={!commentText.trim()}
            >
              <Text style={{ color: commentText.trim() ? '#0095f6' : '#ccc', fontWeight: '600' }}>
                Post
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading posts...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fafafa' }}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}