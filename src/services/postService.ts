import { db } from "@/src/services/firebase";
import { Comment, CreatePostData, Post } from "@/src/types/posts";
import { AuthUser } from "@/src/types/user";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

export const postService = {
  // Create a new post
  async createPost(postData: CreatePostData, user: AuthUser): Promise<void> {
    try {
      // Validate required fields from the AuthUser
      if (!user.uid) {
        throw new Error("User UID is undefined");
      }

      if (!user.name) {
        throw new Error("User name is required");
      }

      if (!postData.imageUrl) {
        throw new Error("Image URL is required");
      }

      // Create the post payload using AuthUser properties
      const postPayload = {
        userId: user.uid,
        username: user.name,
        userAvatar: user.image || "",
        caption: postData.caption || "",
        imageUrl: postData.imageUrl,
        location: postData.location || "",
        likes: [],
        comments: [],
        createdAt: new Date(),
      };

export const postService = {
  /** Create a new post (uploads image if it's a local file URI) */
  async createPost(
    data: { caption: string; imageUrl: string; location?: string },
    user: AuthUser
  ) {
    const remoteUrl = await uploadImageIfNeeded(data.imageUrl, user.uid);

      if (undefinedFields.length > 0) {
        throw new Error(
          `Undefined fields found: ${undefinedFields.join(", ")}`
        );
      }

      await addDoc(collection(db, "posts"), postPayload);
      console.log(" Post created successfully!");
    } catch (error: any) {
      console.error(" Post Service Error:", error);
      console.error(" Error details:", error.message);
      throw new Error(`Failed to create post: ${error.message}`);
    }
  },

  // Get all posts for feed
  async getPosts(): Promise<Post[]> {
    try {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const posts: Post[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        posts.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
        } as Post);
      });

      return posts;
    } catch (error) {
      console.error("Error fetching posts:", error);
      throw new Error("Failed to fetch posts");
    }
  },

  // Like/unlike a post
  async toggleLike(postId: string, userId: string): Promise<void> {
    try {
      const postRef = doc(db, "posts", postId);
      const postDoc = await getDoc(postRef);

      if (!postDoc.exists()) {
        throw new Error("Post not found");
      }

      const post = postDoc.data();
      const currentLikes: string[] = post.likes || [];

      if (currentLikes.includes(userId)) {
        // Unlike: remove user ID from likes array
        await updateDoc(postRef, {
          likes: arrayRemove(userId),
        });
      } else {
        // Like: add user ID to likes array
        await updateDoc(postRef, {
          likes: arrayUnion(userId),
        });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      throw new Error("Failed to toggle like");
    }
  },

  // Add comment
  async addComment(
    postId: string,
    text: string,
    user: AuthUser
  ): Promise<void> {
    try {
      if (!text.trim()) {
        throw new Error("Comment text cannot be empty");
      }

      const postRef = doc(db, "posts", postId);
      const postDoc = await getDoc(postRef);

      if (!postDoc.exists()) {
        throw new Error("Post not found");
      }

      const newComment: Comment = {
        id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: user.uid,
        username: user.name,
        text: text.trim(),
        createdAt: new Date(),
      };

      // Add comment to comments array
      await updateDoc(postRef, {
        comments: arrayUnion(newComment),
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      throw new Error("Failed to add comment");
    }
  },

  // Get single post by ID
  async getPostById(postId: string): Promise<Post | null> {
    try {
      const postRef = doc(db, "posts", postId);
      const postDoc = await getDoc(postRef);

      if (postDoc.exists()) {
        const data = postDoc.data();
        return {
          id: postDoc.id,
          userId: data.userId,
          username: data.username,
          userAvatar: data.userAvatar,
          caption: data.caption,
          imageUrl: data.imageUrl,
          location: data.location,
          likes: data.likes || [],
          comments: data.comments || [],
          createdAt: data.createdAt.toDate(),
        } as Post;
      }
      return null;
    } catch (error) {
      console.error("Error fetching post:", error);
      throw new Error("Failed to fetch post");
    }
  },
  // get all posts by a specific user
  async getPostsByUserId(userId: string): Promise<Post[]> {
    try {
      const q = query(
        collection(db, "posts"),
        where("userId", "==", userId),
      );
      const querySnapshot = await getDocs(q);

      const posts: Post[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        posts.push({
          id: doc.id,
          userId: data.userId,
          username: data.username,
          userAvatar: data.userAvatar,
          caption: data.caption,
          imageUrl: data.imageUrl,
          location: data.location,
          likes: data.likes || [],
          comments: data.comments || [],
          createdAt: data.createdAt.toDate(),
        } as Post);
      });

      return posts;
    } catch (error) {
      console.error("Error fetching user posts:", error);
      throw new Error("Failed to fetch user posts");
    }
  },
};
