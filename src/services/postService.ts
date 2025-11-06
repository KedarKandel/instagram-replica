
import { db } from '@/src/services/firebase';
import { CreatePostData, Post } from '@/src/types/posts';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query
} from 'firebase/firestore';
import { AuthUser } from '../hooks/useAuth';

export const postService = {
  // Create a new post
   async createPost(postData: CreatePostData, user: AuthUser): Promise<void> {
    try {
      
      // Validate required fields from your AuthUser
      if (!user.uid) {
        throw new Error('User UID is undefined');
      }

      if (!user.name) {
        throw new Error('User name is required');
      }

      if (!postData.imageUrl) {
        throw new Error('Image URL is required');
      }

      // Create the post payload using your AuthUser properties
      const postPayload = {
        userId: user.uid,
        username: user.name,
        userAvatar: user.image || '',
        caption: postData.caption || '',
        imageUrl: postData.imageUrl,
        location: postData.location || '',
        likes: [],
        comments: [],
        createdAt: new Date(),
      };

      // Validate that no fields are undefined
      const undefinedFields = Object.entries(postPayload)
        .filter(([, value]) => value === undefined)
        .map(([key]) => key);

      if (undefinedFields.length > 0) {
        throw new Error(`Undefined fields found: ${undefinedFields.join(', ')}`);
      }

      await addDoc(collection(db, 'posts'), postPayload);
      console.log(' Post created successfully!');
      
    } catch (error: any) {
      console.error(' Post Service Error:', error);
      console.error(' Error details:', error.message);
      throw new Error(`Failed to create post: ${error.message}`);
    }
  },

  // Get all posts for feed
  async getPosts(): Promise<Post[]> {
    try {
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
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
      console.error('Error fetching posts:', error);
      throw new Error('Failed to fetch posts');
    }
  },

  // Like/unlike a post
  async toggleLike(postId: string, userId: string): Promise<void> {
    try {
      const postRef = doc(db, 'posts', postId);
      //const postDoc = await getDocs(postRef);
      
      // For simplicity, we'll implement this in the component
      // You can expand this later
    } catch (error) {
      console.error('Error toggling like:', error);
      throw new Error('Failed to toggle like');
    }
  },

  // Add comment
  async addComment(postId: string, text: string, user: any): Promise<void> {
    try {
      const postRef = doc(db, 'posts', postId);
      //const postDoc = await getDocs(postRef);
      
      // For simplicity, we'll implement this in the component
    } catch (error) {
      console.error('Error adding comment:', error);
      throw new Error('Failed to add comment');
    }
  },
};