// libraries
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// custom imports
import { useAuth } from "@/src/hooks/useAuth";
import { Post } from "@/src/types/posts";

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
  commentText = "",
  onCommentTextChange = () => {},
  onUserPress,
}) => {
  const { user } = useAuth();

  // --- SAFETY + COMPAT LAYER ---
  // Handle different Firestore field names + missing arrays
  const likes: string[] = Array.isArray((post as any).likes) ? (post as any).likes : [];
  const comments: any[] = Array.isArray((post as any).comments) ? (post as any).comments : [];

  const imageUrl: string =
    (post as any).imageUrl ||
    (post as any).image ||
    "https://via.placeholder.com/600x600?text=No+Image";

  const userAvatar: string =
    (post as any).userAvatar ||
    (post as any).avatar ||
    (post as any).photoURL ||
    "https://via.placeholder.com/40";

  const caption: string = (post as any).caption || "";
  const username: string = (post as any).username || "Unknown";
  const userId: string = (post as any).userId || "";

  // createdAt can be Date OR Firestore Timestamp OR missing
  const createdAtDate: Date = (() => {
    const raw: any = (post as any).createdAt;
    if (!raw) return new Date();
    if (raw instanceof Date) return raw;
    // Firestore Timestamp { seconds, nanoseconds } or has toDate()
    if (typeof raw?.toDate === "function") return raw.toDate();
    if (typeof raw?.seconds === "number") return new Date(raw.seconds * 1000);
    return new Date();
  })();

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.max(0, Math.floor(diffInHours * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
  };

  const isLiked = user ? likes.includes(user.uid) : false;
  const isCommentActive = activeCommentPost === (post as any).id;

  const handleUserPress = () => {
    if (onUserPress) onUserPress(userId, username);
  };

  return (
    <View style={styles.container}>
      {/* Post Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleUserPress} style={styles.userContainer}>
          <Image source={{ uri: userAvatar }} style={styles.avatar} />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleUserPress} style={styles.userInfo}>
          <Text style={styles.username}>{username}</Text>
          {(post as any).location ? (
            <Text style={styles.location}>{(post as any).location}</Text>
          ) : null}
        </TouchableOpacity>

        <Text style={styles.timestamp}>{formatTime(createdAtDate)}</Text>
      </View>

      {/* Post Image */}
      <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />

      {/* Post Actions */}
      <View style={styles.actions}>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={() => onLike((post as any).id)}
            style={styles.actionButton}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={24}
              color={isLiked ? "red" : "black"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onToggleComment((post as any).id)}
            style={styles.actionButton}
          >
            <Ionicons name="chatbubble-outline" size={24} />
          </TouchableOpacity>
        </View>

        {/* Likes */}
        {likes.length > 0 && (
          <Text style={styles.likes}>
            {likes.length} {likes.length === 1 ? "like" : "likes"}
          </Text>
        )}

        {/* Caption */}
        {caption ? (
          <Text style={styles.caption}>
            <TouchableOpacity onPress={handleUserPress}>
              <Text style={styles.captionUsername}>{username}</Text>
            </TouchableOpacity>
            {` ${caption}`}
          </Text>
        ) : null}

        {/* Comments Preview */}
        {comments.slice(0, 2).map((comment: any, idx: number) => (
          <Text key={comment?.id ?? `${(post as any).id}-c-${idx}`} style={styles.comment}>
            <TouchableOpacity
              onPress={() => {
                if (onUserPress && comment?.userId && comment?.username) {
                  onUserPress(comment.userId, comment.username);
                }
              }}
            >
              <Text style={styles.commentUsername}>{comment?.username ?? "User"}</Text>
            </TouchableOpacity>
            {` ${comment?.text ?? ""}`}
          </Text>
        ))}

        {comments.length > 2 && (
          <Text style={styles.viewComments}>View all {comments.length} comments</Text>
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
              onPress={() => onAddComment((post as any).id, commentText)}
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
    backgroundColor: "white",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "600",
    fontSize: 14,
    color: "#0095f6",
  },
  location: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
  },
  image: {
    width: "100%",
    height: 300,
    backgroundColor: "#f2f2f2",
  },
  actions: {
    padding: 12,
  },
  actionButtons: {
    flexDirection: "row",
    marginBottom: 8,
  },
  actionButton: {
    marginRight: 16,
  },
  likes: {
    fontWeight: "600",
    marginBottom: 4,
    fontSize: 14,
  },
  caption: {
    marginBottom: 4,
    fontSize: 14,
    lineHeight: 18,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  captionUsername: {
    fontWeight: "600",
    color: "#0095f6",
  },
  comment: {
    marginBottom: 2,
    fontSize: 14,
    lineHeight: 18,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  commentUsername: {
    fontWeight: "600",
    color: "#0095f6",
  },
  viewComments: {
    color: "#666",
    marginBottom: 4,
    fontSize: 14,
  },
  addComment: {
    flexDirection: "row",
    marginTop: 8,
    alignItems: "center",
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
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
    color: "#0095f6",
    fontWeight: "600",
    fontSize: 14,
  },
  postTextDisabled: {
    color: "#ccc",
  },
});
