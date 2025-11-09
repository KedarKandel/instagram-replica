//libraries
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// custom imports
import { useAuth } from '@/src/hooks/useAuth';
import { Post } from '@/src/types/posts';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  activeCommentPost?: string | null;
  onToggleComment: (postId: string) => void;
  commentText?: string;
  onCommentTextChange?: (text: string) => void;
  onUserPress?: (userId: string, username: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onAddComment,
  activeCommentPost,
  onToggleComment,
  commentText = '',
  onCommentTextChange = () => {},
  onUserPress,
}) => {
  const { user } = useAuth();

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
  };

  const isLiked = user ? post.likes.includes(user.uid) : false;
  const isCommentActive = activeCommentPost === post.id;

  const handleUserPress = () => {
    if (onUserPress) {
      onUserPress(post.userId, post.username);
    }
  };

  return (
    <View style={styles.container}>
      {/* Post Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleUserPress} style={styles.userContainer}>
          <Image 
            source={{ uri: post.userAvatar || 'https://via.placeholder.com/40' }} 
            style={styles.avatar} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleUserPress} style={styles.userInfo}>
          <Text style={styles.username}>{post.username}</Text>
          {post.location && <Text style={styles.location}>{post.location}</Text>}
        </TouchableOpacity>
        
        <Text style={styles.timestamp}>{formatTime(post.createdAt)}</Text>
      </View>

      {/* Post Image */}
      <Image 
        source={{ uri: post.imageUrl }} 
        style={styles.image} 
        resizeMode="cover"
      />

      {/* Post Actions */}
      <View style={styles.actions}>
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={() => onLike(post.id)} style={styles.actionButton}>
            <Ionicons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={24} 
              color={isLiked ? "red" : "black"} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => onToggleComment(post.id)}
            style={styles.actionButton}
          >
            <Ionicons name="chatbubble-outline" size={24} />
          </TouchableOpacity>
        </View>

        {/* Likes */}
        {post.likes.length > 0 && (
          <Text style={styles.likes}>
            {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
          </Text>
        )}

        {/* Caption */}
        <Text style={styles.caption}>
          <TouchableOpacity onPress={handleUserPress}>
            <Text style={styles.captionUsername}>{post.username}</Text>
          </TouchableOpacity>
          {` ${post.caption}`}
        </Text>

        {/* Comments Preview */}
        {post.comments.slice(0, 2).map(comment => (
          <Text key={comment.id} style={styles.comment}>
            <TouchableOpacity onPress={() => {
              // clickable username in comments
              if (onUserPress) {
                onUserPress(comment.userId, comment.username);
              }
            }}>
              <Text style={styles.commentUsername}>{comment.username}</Text>
            </TouchableOpacity>
            {` ${comment.text}`}
          </Text>
        ))}

        {post.comments.length > 2 && (
          <Text style={styles.viewComments}>
            View all {post.comments.length} comments
          </Text>
        )}

        {/* Add Comment */}
        {isCommentActive && (
          <View style={styles.addComment}>
            <TextInput
              placeholder="Add a comment..."
              value={commentText}
              onChangeText={onCommentTextChange}
              style={styles.commentInput}
              autoFocus
            />
            <TouchableOpacity 
              onPress={() => onAddComment(post.id, commentText)}
              disabled={!commentText.trim()}
              style={styles.postButton}
            >
              <Text style={[styles.postText, !commentText.trim() && styles.postTextDisabled]}>
                Post
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  userContainer: {
    marginRight: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontWeight: '600',
    fontSize: 14,
    color: '#0095f6',
  },
  location: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  image: {
    width: '100%',
    height: 300,
  },
  actions: {
    padding: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  actionButton: {
    marginRight: 16,
  },
  likes: {
    fontWeight: '600',
    marginBottom: 4,
    fontSize: 14,
  },
  caption: {
    marginBottom: 4,
    fontSize: 14,
    lineHeight: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  captionUsername: {
    fontWeight: '600',
    color: '#0095f6', // Blue color to indicate it's clickable
  },
  comment: {
    marginBottom: 2,
    fontSize: 14,
    lineHeight: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  commentUsername: {
    fontWeight: '600',
    color: '#0095f6', // Blue color to indicate it's clickable
  },
  viewComments: {
    color: '#666',
    marginBottom: 4,
    fontSize: 14,
  },
  addComment: {
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'center',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 14,
  },
  postButton: {
    paddingHorizontal: 8,
  },
  postText: {
    color: '#0095f6',
    fontWeight: '600',
    fontSize: 14,
  },
  postTextDisabled: {
    color: '#ccc',
  },
});