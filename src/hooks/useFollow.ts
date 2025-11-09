
import { followService } from '@/src/services/followService';
import { useCallback, useState } from 'react';
import { useAuth } from './useAuth';

export const useFollow = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);



  // follow a user
  const followUser = useCallback(async (targetUserId: string): Promise<void> => {
    if (!user) throw new Error('No user logged in');
    
    setIsLoading(true);
    clearError();
    
    try {
      await followService.followUser(user.uid, targetUserId);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to follow user';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user]);


  // unfollow a user
  const unfollowUser = useCallback(async (targetUserId: string): Promise<void> => {
    if (!user) throw new Error('No user logged in');
    
    setIsLoading(true);
    clearError();
    
    try {
      await followService.unfollowUser(user.uid, targetUserId);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to unfollow user';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user]);


  // check if current user is following target user
  const isFollowing = useCallback(async (targetUserId: string): Promise<boolean> => {
    if (!user) return false;
    return followService.isFollowing(user.uid, targetUserId);
  }, [user]);

  return {
    followUser,
    unfollowUser,
    isFollowing,
    isLoading,
    error,
    clearError,
  };
};