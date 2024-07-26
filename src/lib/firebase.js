// src/lib/firebase.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyDm_YjpL1jv1iRAIiNEIbmyJtPBhhOGs3Y",
    authDomain: "newrajmachat.firebaseapp.com",
    projectId: "newrajmachat",
    storageBucket: "newrajmachat.appspot.com",
    messagingSenderId: "555475852770",
    appId: "1:555475852770:web:676c39fb3b81ffe5812dbb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
