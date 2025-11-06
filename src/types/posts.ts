
export interface Post {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  caption: string;
  imageUrl: string;
  location?: string;
  likes: string[]; // User IDs who liked
  comments: Comment[];
  createdAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  createdAt: Date;
}

export interface CreatePostData {
  caption: string;
  imageUrl: string;
  location?: string;
}