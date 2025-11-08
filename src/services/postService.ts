// src/services/postService.ts
import type { AuthUser } from "@/src/hooks/useAuth";
import { db, storage } from "@/src/services/firebase";
import type { Post } from "@/src/types/posts";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

type FirestorePost = {
  userId: string;
  username: string;
  userAvatar?: string | null;
  imageUrl: string;
  caption?: string;
  location?: string | null;
  likes?: string[];
  commentsPreview?: { id: string; username: string; text: string }[];
  createdAt?: any;
  updatedAt?: any;
  commentCount?: number;
};

function adaptPost(id: string, d: FirestorePost): Post {
  return {
    id,
    userId: d.userId,
    username: d.username,
    userAvatar: d.userAvatar ?? undefined,
    caption: d.caption ?? "",
    imageUrl: d.imageUrl,
    location: d.location ?? undefined,
    likes: Array.isArray(d.likes) ? d.likes : [],
    comments: Array.isArray(d.commentsPreview) ? d.commentsPreview : [],
    createdAt: d.createdAt?.toDate ? d.createdAt.toDate() : new Date(),
    commentCount: typeof d.commentCount === "number" ? d.commentCount : 0,
  } as Post;
}

async function uploadImageIfNeeded(localOrRemoteUri: string, uid: string) {
  // If it's already a remote URL, just return it
  if (!localOrRemoteUri.startsWith("file://")) return localOrRemoteUri;

  const res = await fetch(localOrRemoteUri);
  const blob = await res.blob();
  const fileRef = ref(storage, `posts/${uid}-${Date.now()}.jpg`);
  await uploadBytes(fileRef, blob);
  return await getDownloadURL(fileRef);
}

export const postService = {
  /** Create a new post (uploads image if it's a local file URI) */
  async createPost(
    data: { caption: string; imageUrl: string; location?: string },
    user: AuthUser
  ) {
    const remoteUrl = await uploadImageIfNeeded(data.imageUrl, user.uid);

    const ref = doc(collection(db, "posts"));
    await setDoc(ref, {
      userId: user.uid,
      username: user.name,
      userAvatar: user.image ?? null,
      imageUrl: remoteUrl,
      caption: data.caption,
      location: data.location || null,
      likes: [],                // for PostCard
      commentsPreview: [],      // 2-comment preview for feed
      commentCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return ref.id;
  },

  /** Feed subscription (newest first) */
  subscribeFeed(cb: (posts: Post[]) => void) {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(50));
    return onSnapshot(q, (snap) => {
      cb(snap.docs.map((d) => adaptPost(d.id, d.data() as FirestorePost)));
    });
  },

  /** Toggle like for current user (uses arrayUnion/arrayRemove to match PostCard) */
  async toggleLike(postId: string, uid: string) {
    const ref = doc(db, "posts", postId);
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) throw new Error("Post not found");
      const data = snap.data() as FirestorePost;
      const liked = new Set<string>(Array.isArray(data.likes) ? data.likes : []).has(uid);

      tx.update(ref, {
        likes: liked ? arrayRemove(uid) : arrayUnion(uid),
        updatedAt: serverTimestamp(),
      });
    });
  },

  /** Add a comment; update preview & count */
  async addComment(
    postId: string,
    payload: { authorId: string; username: string; text: string }
  ) {
    const commentsCol = collection(db, "posts", postId, "comments");
    const newDoc = await addDoc(commentsCol, {
      ...payload,
      createdAt: serverTimestamp(),
    });

    const postRef = doc(db, "posts", postId);
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(postRef);
      if (!snap.exists()) return;
      const data = snap.data() as FirestorePost;
      const prev = Array.isArray(data.commentsPreview) ? data.commentsPreview.slice(0, 1) : [];
      const next = [
        { id: newDoc.id, username: payload.username, text: payload.text },
        ...prev,
      ].slice(0, 2);

      tx.update(postRef, {
        commentsPreview: next,
        commentCount: increment(1),
        updatedAt: serverTimestamp(),
      });
    });
  },
};
