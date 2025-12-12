import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBwHohAH7r-otA-CzXDhwNz7z3Imj9HVHo",
  authDomain: "instagram-replica-emmi.firebaseapp.com",
  projectId: "instagram-replica-emmi",
  storageBucket: "instagram-replica-emmi.firebasestorage.app",
  messagingSenderId: "298370632956",
  appId: "1:298370632956:web:042a7bff4ea0da1f9c9b79",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Keep compatibility with the existing codebase:
export const getFirebaseAuth = () => auth;
export const getFirestoreDb = () => db;

export default app;
