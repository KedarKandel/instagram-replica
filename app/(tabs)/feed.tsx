import { PostCard } from "@/src/components/PostCard";
import { useAuth } from "@/src/hooks/useAuth";
import { postService } from "@/src/services/postService";
import type { Post } from "@/src/types/posts";
import { useEffect, useState } from "react";
import { FlatList, View } from "react-native";

export default function FeedScreen() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    const unsub = postService.subscribeFeed(setPosts);
    return () => unsub();
  }, []);

  const onLike = async (postId: string) => {
    if (!user) return;
    // optimistic UI
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, likes: p.likes.includes(user.uid) ? p.likes.filter(id => id !== user.uid) : [...p.likes, user.uid] }
        : p
    ));
    await postService.toggleLike(postId, user.uid);
  };

  const onToggleComment = (postId: string) => {
    setActiveCommentPost(id => (id === postId ? null : postId));
    setCommentText("");
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
          />
        )}
      />
    </View>
  );
}
