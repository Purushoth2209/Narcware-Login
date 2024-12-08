import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBCg8TezJ8uG9VLUkIsqs0oznR2Rce1NFA",
  authDomain: "login-page-24.firebaseapp.com",
  projectId: "login-page-24",
  storageBucket: "login-page-24.firebasestorage.app",
  messagingSenderId: "179757259676",
  appId: "1:179757259676:web:51159ee85c28dd95a30659",
  measurementId: "G-0DQSXZ0D0S",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);  // Get Firebase Auth instance
const db = getFirestore(app);  // Get Firestore instance
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    // Persistence is set, no further action needed.
  })
  .catch((error) => {
    console.error('Error setting persistence:', error);
  });

// Export auth and db to be used in other files
export { auth, db };
