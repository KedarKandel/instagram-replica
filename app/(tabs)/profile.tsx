// libraries imports

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// custom imports
import { useAuth } from '@/src/hooks/useAuth';

const Profile = () => {
  const { user,  logout, isLoading } = useAuth();

  const handleSignout = async () => {
    try {
      await logout();
      router.replace('/(authScreens)/sign-in');
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  const handleEditProfile = () => {
    router.push('/(protectedScreens)/edit-profile'); // Navigate to Edit Profile screen(router.push imp)
  };

  if (isLoading) {
    return (
      <View style={profileStyles.centered}>
        <ActivityIndicator size="large" color="#0095f6" />
        <Text style={profileStyles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={profileStyles.container}>
      {/* Header */}
      <View style={profileStyles.header}>
        <View style={profileStyles.profileInfo}>
          <Image 
            source={{ uri: user?.image || 'https://profile.com' }} 
            style={profileStyles.avatar}
          />
          <Text style={profileStyles.username}>
            {user?.name || 'User'}
          </Text>
          <Text style={profileStyles.email}>
            {user?.email}
          </Text>
          
          {/* Stats */}
          <View style={profileStyles.statsContainer}>
            <View style={profileStyles.stat}>
              <Text style={profileStyles.statNumber}>
                {user?.posts?.length || 0}
              </Text>
              <Text style={profileStyles.statLabel}>Posts</Text>
            </View>
            <View style={profileStyles.stat}>
              <Text style={profileStyles.statNumber}>
                {user?.followers?.length || 0}
              </Text>
              <Text style={profileStyles.statLabel}>Followers</Text>
            </View>
            <View style={profileStyles.stat}>
              <Text style={profileStyles.statNumber}>
                {user?.following?.length || 0}
              </Text>
              <Text style={profileStyles.statLabel}>Following</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Edit Profile Button */}
      <Pressable 
        onPress={handleEditProfile}
        style={profileStyles.section}
      >
        <View style={profileStyles.menuItem}>
          <Ionicons name="create-outline" size={24} color="#333" />
          <Text style={profileStyles.menuText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </View>
      </Pressable>

      {/* Settings Section ---for now i don't want to work on all these settings */}
      <View style={profileStyles.section}>
        <Text style={profileStyles.sectionTitle}>Settings</Text>
        
        <Pressable style={profileStyles.menuItem}>
          <Ionicons name="notifications-outline" size={24} color="#333" />
          <Text style={profileStyles.menuText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </Pressable>

        <Pressable style={profileStyles.menuItem}>
          <Ionicons name="lock-closed-outline" size={24} color="#333" />
          <Text style={profileStyles.menuText}>Privacy</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </Pressable>

        <Pressable style={profileStyles.menuItem}>
          <Ionicons name="help-circle-outline" size={24} color="#333" />
          <Text style={profileStyles.menuText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </Pressable>

        <Pressable style={profileStyles.menuItem}>
          <Ionicons name="information-circle-outline" size={24} color="#333" />
          <Text style={profileStyles.menuText}>About</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </Pressable>
      </View>

      {/* Sign Out Button */}
      <Pressable 
        onPress={handleSignout}
        style={profileStyles.signOutButton}
      >
        <Text style={profileStyles.signOutText}>Sign Out</Text>
      </Pressable>
    </ScrollView>
  );
};

export default Profile;



 const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  profileInfo: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e5e5e5',
    marginBottom: 12,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  menuText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  signOutButton: {
    backgroundColor: 'white',
    marginTop: 12,
    padding: 16,
    alignItems: 'center',
  },
  signOutText: {
    color: 'red',
    fontSize: 16,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
});