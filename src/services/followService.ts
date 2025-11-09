
import { AuthUser } from '@/src/types/user';
import {
    arrayRemove,
    arrayUnion,
    doc,
    getDoc,
    updateDoc
} from 'firebase/firestore';
import { db } from './firebase';

export const followService = {
  // Follow a user
  async followUser(currentUserId: string, targetUserId: string): Promise<void> {
    try {
      if (currentUserId === targetUserId) {
        throw new Error('You cannot follow yourself');
      }

      const currentUserRef = doc(db, 'users', currentUserId);
      const targetUserRef = doc(db, 'users', targetUserId);

      // Add target user to current user's following list
      await updateDoc(currentUserRef, {
        following: arrayUnion(targetUserId)
      });

      // Add current user to target user's followers list
      await updateDoc(targetUserRef, {
        followers: arrayUnion(currentUserId)
      });

    } catch (error) {
      console.error('Error following user:', error);
      throw new Error('Failed to follow user');
    }
  },

  // Unfollow a user
  async unfollowUser(currentUserId: string, targetUserId: string): Promise<void> {
    try {
      const currentUserRef = doc(db, 'users', currentUserId);
      const targetUserRef = doc(db, 'users', targetUserId);

      // Remove target user from current user's following list
      await updateDoc(currentUserRef, {
        following: arrayRemove(targetUserId)
      });

      // Remove current user from target user's followers list
      await updateDoc(targetUserRef, {
        followers: arrayRemove(currentUserId)
      });

    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw new Error('Failed to unfollow user');
    }
  },

  // Check if current user is following target user
  async isFollowing(currentUserId: string, targetUserId: string): Promise<boolean> {
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUserId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const following: string[] = userData.following || [];
        return following.includes(targetUserId);
      }
      
      return false;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  },

  // Get user's followers count
  async getFollowersCount(userId: string): Promise<number> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.followers?.length || 0;
      }
      
      return 0;
    } catch (error) {
      console.error('Error getting followers count:', error);
      return 0;
    }
  },

  // Get user's following count
  async getFollowingCount(userId: string): Promise<number> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.following?.length || 0;
      }
      
      return 0;
    } catch (error) {
      console.error('Error getting following count:', error);
      return 0;
    }
  },

  // Get followers list with user data
  async getFollowers(userId: string): Promise<AuthUser[]> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        return [];
      }

      const userData = userDoc.data();
      const followerIds: string[] = userData.followers || [];

      const followers: AuthUser[] = [];
      
      for (const followerId of followerIds) {
        const followerDoc = await getDoc(doc(db, 'users', followerId));
        if (followerDoc.exists()) {
          const followerData = followerDoc.data();
          followers.push({
            uid: followerDoc.id,
            name: followerData.name,
            email: followerData.email,
            image: followerData.image,
            followers: followerData.followers || [],
            following: followerData.following || [],
            posts: followerData.posts || [],
            createdAt: followerData.createdAt,
          });
        }
      }

      return followers;
    } catch (error) {
      console.error('Error getting followers:', error);
      return [];
    }
  },

  // Get following list with user data
  async getFollowing(userId: string): Promise<AuthUser[]> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        return [];
      }

      const userData = userDoc.data();
      const followingIds: string[] = userData.following || [];

      const following: AuthUser[] = [];
      
      for (const followingId of followingIds) {
        const followingDoc = await getDoc(doc(db, 'users', followingId));
        if (followingDoc.exists()) {
          const followingData = followingDoc.data();
          following.push({
            uid: followingDoc.id,
            name: followingData.name,
            email: followingData.email,
            image: followingData.image,
            followers: followingData.followers || [],
            following: followingData.following || [],
            posts: followingData.posts || [],
            createdAt: followingData.createdAt,
          });
        }
      }

      return following;
    } catch (error) {
      console.error('Error getting following:', error);
      return [];
    }
  }
};