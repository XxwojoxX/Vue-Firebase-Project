import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { signInWithEmailAndPassword, getAuth, signOut } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage, ref, uploadBytes, getDownloadURL, listAll };

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  }
  catch (error) {
    return error;
  }
}

export const logoutUser = async () => {
  try {
    await auth.signOut();
    return true;
  }
  catch (error) {
    return error;
  }
}