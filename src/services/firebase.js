import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// These should be replaced with actual config from Firebase Console
const firebaseConfig = {

  apiKey: "AIzaSyBpo3P8nj6qiYdRfJ-mkECZt7uOqJ6atIE",

  authDomain: "studyhub-v2-f481a.firebaseapp.com",

  projectId: "studyhub-v2-f481a",

  storageBucket: "studyhub-v2-f481a.firebasestorage.app",

  messagingSenderId: "878830372282",

  appId: "1:878830372282:web:c1887772f96f25f8040983"

};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
