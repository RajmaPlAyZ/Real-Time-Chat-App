// src/lib/firebase.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyBXfZNoLS2Khx6nyavCa0cEWrmNaQ1_hLc",
  authDomain: "final-82893.firebaseapp.com",
  projectId: "final-82893",
  storageBucket: "final-82893.appspot.com",
  messagingSenderId: "720823864310",
  appId: "1:720823864310:web:3e20720ec407f58bc1d5d7",
  measurementId: "G-HM6X17QXSH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
