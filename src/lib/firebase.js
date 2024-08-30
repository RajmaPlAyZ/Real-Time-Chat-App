// src/lib/firebase.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyBxFlO4nMk4NXZg3oR7p4kNaQvLHIyPHO8",
    authDomain: "secondrajma.firebaseapp.com",
    projectId: "secondrajma",
    storageBucket: "secondrajma.appspot.com",
    messagingSenderId: "37960098241",
    appId: "1:37960098241:web:e776265501ad4eacaacf40",
    measurementId: "G-XGVMNBTJ8R"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
