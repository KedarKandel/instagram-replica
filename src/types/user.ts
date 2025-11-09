
// Extended user model
export interface AuthUser {
  uid: string;
  name: string;
  email: string | null;
  image?: string | null;
  followers: string[];
  following: string[];
  posts: string[];
  createdAt?: any;
}



export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  profilePicture?: string;
  bio?: string;
  website?: string;
  followers: string[];
  following: string[];
  posts: string[];
  createdAt: Date;
  updatedAt: Date;
}