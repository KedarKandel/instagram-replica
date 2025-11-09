import { useAuth } from '@/src/hooks/useAuth';
import { useFollow } from '@/src/hooks/useFollow';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity } from 'react-native';

interface FollowButtonProps {
  targetUserId: string;
  onFollowChange?: (isFollowing: boolean) => void;
}

export const FollowButton: React.FC<FollowButtonProps> = ({ 
  targetUserId, 
  onFollowChange 
}) => {
  const { followUser, unfollowUser, isFollowing: checkIsFollowing, isLoading: isActionLoading } = useFollow();
  const { user: currentUser } = useAuth(); 
  const router = useRouter(); 
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if the current user is viewing their own profile
  const isOwnProfile = currentUser?.uid === targetUserId;

  useEffect(() => {
    if (!isOwnProfile) {
      loadFollowStatus();
    } else {
      setIsChecking(false);
    }
  }, [targetUserId, isOwnProfile]);

  const loadFollowStatus = async () => {
    try {
      const following = await checkIsFollowing(targetUserId);
      setIsFollowing(following);
    } catch (error) {
      console.error('Error loading follow status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await unfollowUser(targetUserId);
        setIsFollowing(false);
        onFollowChange?.(false);
      } else {
        await followUser(targetUserId);
        setIsFollowing(true);
        onFollowChange?.(true);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update follow status');
    }
  };

  const handleOwnProfilePress = () => {
    // Redirect to the user's own profile screen
    router.push('/(protectedScreens)/edit-profile');
  };

  if (isChecking && !isOwnProfile) {
    return (
      <TouchableOpacity
        style={styles.button}
        disabled
      >
        <ActivityIndicator size="small" color="#666" />
      </TouchableOpacity>
    );
  }

  // If it's the user's own profile, show "Edit Profile" button
  if (isOwnProfile) {
    return (
      <TouchableOpacity
        onPress={handleOwnProfilePress}
        style={styles.editButton}
      >
        <Text style={styles.editText}>Edit Profile</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handleFollowToggle}
      disabled={isActionLoading}
      style={[
        styles.button,
        isFollowing ? styles.followingButton : styles.followButton,
        isActionLoading && styles.disabledButton
      ]}
    >
      {isActionLoading ? (
        <ActivityIndicator size="small" color={isFollowing ? "#666" : "white"} />
      ) : (
        <Text style={isFollowing ? styles.followingText : styles.followText}>
          {isFollowing ? 'Following' : 'Follow'}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = {
  button: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center' as const,
  },
  followButton: {
    backgroundColor: '#0095f6',
  },
  followingButton: {
    backgroundColor: '#f0f0f0',
  },
  disabledButton: {
    opacity: 0.7,
  },
  followText: {
    color: 'white',
    fontWeight: '600' as const,
    fontSize: 14,
  },
  followingText: {
    color: '#333',
    fontWeight: '600' as const,
    fontSize: 14,
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center' as const,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  editText: {
    color: '#333',
    fontWeight: '600' as const,
    fontSize: 14,
  },
};