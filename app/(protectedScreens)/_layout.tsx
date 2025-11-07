
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { TouchableOpacity } from 'react-native';

export default function ProtectedLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
        headerLeft: ({ canGoBack }) =>
          canGoBack ? (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={{ marginLeft: 16 }}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
          ) : null,
      }}
    >
      <Stack.Screen 
        name="edit-profile" 
        options={{ 
          title: 'Edit Profile',
        }} 
      />
      <Stack.Screen 
        name="post-detail" 
        options={{ 
          title: 'Post',
        }} 
      />
      <Stack.Screen 
        name="contact" 
        options={{ 
          title: 'Contact',
        }} 
      />
    </Stack>
  );
}