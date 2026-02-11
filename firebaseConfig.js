import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
