import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDCgE4xPHZgyfedASAu_R64xBHonzkc9YI",
  authDomain: "api-assertify.firebaseapp.com",
  projectId: "api-assertify",
  storageBucket: "api-assertify.firebasestorage.app",
  messagingSenderId: "150333708336",
  appId: "1:150333708336:web:29ad95cb266fedabc5f5f5",
  measurementId: "G-NM2X8BX9R7"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);