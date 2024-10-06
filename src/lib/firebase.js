// src/lib/firebase.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyBeTBUHOOXbwdpSeR-blvMY9r6mXX4zMQw",
  authDomain: "thirdrajma.firebaseapp.com",
  projectId: "thirdrajma",
  storageBucket: "thirdrajma.appspot.com",
  messagingSenderId: "5113873812",
  appId: "1:5113873812:web:c3d98a1c8fe4b86459fb81",
  measurementId: "G-1EGX8WC99Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
