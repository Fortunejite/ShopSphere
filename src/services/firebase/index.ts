// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || '',
  authDomain: "talking-34f62.firebaseapp.com",
  projectId: "talking-34f62",
  storageBucket: "talking-34f62.appspot.com",
  appId: "1:24426648864:web:9b85eb96c9e788e0d87345",
  measurementId: "G-64N0P575VV"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
