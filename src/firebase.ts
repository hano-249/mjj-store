import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBWsBez93EV8cAjE57Cd97ab_EmKEQ0184",
  authDomain: "mjj-store.firebaseapp.com",
  projectId: "mjj-store",
  storageBucket: "mjj-store.firebasestorage.app",
  messagingSenderId: "1006970604777",
  appId: "1:1006970604777:web:52ba6c6a29ff91a72cb478",
  measurementId: "G-LW21ZBLWSQ"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();

export { 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut
};

