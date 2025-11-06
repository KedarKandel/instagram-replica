import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";

import { db, getFirebaseAuth } from "@/src/services/firebase";

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

interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (name: string, image?: string) => Promise<void>;

  error: string | null;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // ---------------------------
  //  Sign Up
  // ---------------------------
  const signUp = async (
    email: string,
    password: string,
    name?: string
  ): Promise<void> => {
    try {
      setIsLoading(true);
      clearError();
      const auth = getFirebaseAuth();

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const firebaseUser = userCredential.user;

      // Update Firebase Auth display name
      if (name) {
        await updateProfile(firebaseUser, { displayName: name });
      }

      // Create Firestore user profile
      await setDoc(doc(db, "users", firebaseUser.uid), {
        uid: firebaseUser.uid,
        name: name || "",
        email: firebaseUser.email,
        image: firebaseUser.photoURL || null,
        followers: [],
        following: [],
        posts: [],
        createdAt: serverTimestamp(),
      });
    } catch (err: any) {
      const message = getAuthErrorMessage(err.code);
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------
  //  Sign In
  // ---------------------------
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      clearError();
      const auth = getFirebaseAuth();
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      const message = getAuthErrorMessage(err.code);
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------
  //  Logout
  // ---------------------------
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      clearError();
      const auth = getFirebaseAuth();
      await signOut(auth);
      setUser(null);
    } catch (err: any) {
      const message = getAuthErrorMessage(err.code);
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------
  //  Reset Password
  // ---------------------------
  const resetPassword = async (email: string): Promise<void> => {
    try {
      setIsLoading(true);
      clearError();
      const auth = getFirebaseAuth();
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      const message = getAuthErrorMessage(err.code);
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------
  //  Update Profile
  // ---------------------------
  const updateUserProfile = async (
    name: string,
    image?: string
  ): Promise<void> => {
    if (!user) throw new Error("No user logged in");
    const auth = getFirebaseAuth();
    try {
      setIsLoading(true);
      clearError();

      // Update Firebase Auth profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: name,
          photoURL: image || null,
        });
      }

      // Update Firestore user doc
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        name,
        image: image || null,
      });

      // Update local state
      setUser({ ...user, name, image });
    } catch (err: any) {
      const message = getAuthErrorMessage(err.code);
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------
  //  Auth State Listener
  // ---------------------------
  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch Firestore profile
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as AuthUser;
            setUser(data);
          } else {
            // fallback if no profile
            setUser({
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || "",
              email: firebaseUser.email,
              image: firebaseUser.photoURL || null,
              followers: [],
              following: [],
              posts: [],
            });
          }
        } catch (err) {
          console.error("Failed to fetch user profile:", err);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    logout,
    resetPassword,
    updateUserProfile,
    error,
    clearError,
  };
}

// ---------------------------
//  Error Message Helper
// ---------------------------
function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case "auth/invalid-email":
      return "Invalid email address format.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password should be at least 6 characters long.";
    case "auth/network-request-failed":
      return "Network error. Please check your connection.";
    case "auth/too-many-requests":
      return "Too many unsuccessful attempts. Please try again later.";
    case "auth/requires-recent-login":
      return "Please sign in again to perform this action.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
}
