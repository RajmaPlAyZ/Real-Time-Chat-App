// src/lib/firebase.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyDgzwZMIptcduENcSyGMIhShbyawJhLEdo",
  authDomain: "presentation-chat.firebaseapp.com",
  projectId: "presentation-chat",
  storageBucket: "presentation-chat.firebasestorage.app",
  messagingSenderId: "679116034604",
  appId: "1:679116034604:web:e8c2f3a18ad82f90beb789",
  measurementId: "G-BMXW9W89E4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
