import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKrTdXFW2DDsmD6STgcgszEJOEMUENBZY",
  authDomain: "tennis-tracker-f370d.firebaseapp.com",
  projectId: "tennis-tracker-f370d",
  storageBucket: "tennis-tracker-f370d.firebasestorage.app",
  messagingSenderId: "930040866964",
  appId: "1:930040866964:web:1019757aca7206b8f1ec81",
  measurementId: "G-N89WX32JN2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with React Native persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
export const db = getFirestore(app);

export default app;
