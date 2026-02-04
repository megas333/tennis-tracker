# Tennis Tracker App

A React Native mobile app for tracking recreational tennis matches with statistics and insights.

## Features

- **User Authentication**: Register and login securely
- **Match Tracking**: Log matches with opponent, score, court type
- **Statistics Dashboard**:
  - Overall win/loss record and win rate
  - Current win streak
  - Last 5 matches
  - Monthly performance
  - Opponent statistics (most beaten, toughest opponents)
- **Match History**: View all past matches
- **Clean UI**: Simple, intuitive design optimized for mobile

## Tech Stack

- **Frontend**: React Native (Expo)
- **Backend**: Firebase
  - Authentication
  - Firestore Database
  - Real-time sync

## Setup Instructions

### 1. Install Prerequisites

```bash
# Install Node.js (16+ required)
# Install Expo CLI
npm install -g expo-cli
```

### 2. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** (Email/Password)
4. Enable **Firestore Database** (Start in test mode for development)
5. Go to Project Settings > General
6. Scroll to "Your apps" and click Web icon (</>)
7. Copy the Firebase configuration

### 3. Configure Firebase

1. Open `firebaseConfig.js`
2. Replace the placeholder values with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  // ... other values
};
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the App

```bash
# Start Expo development server
npm start

# Or run directly on iOS
npm run ios

# Or run directly on Android
npm run android
```

### 6. Connect Firebase to App

In `TennisTrackerApp.jsx`, uncomment the Firebase imports and integrate the authentication and database functions:

**Authentication:**
```javascript
import { auth } from './firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

// In handleAuth function:
if (isRegister) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  setUser(userCredential.user);
} else {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  setUser(userCredential.user);
}
```

**Firestore:**
```javascript
import { db } from './firebaseConfig';
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';

// In addMatch function:
await addDoc(collection(db, 'matches'), {
  userId: user.uid,
  opponent: opponentName,
  myScore,
  opponentScore,
  courtType,
  result,
  date: matchDate,
  createdAt: new Date()
});

// In loadMatches function:
const q = query(
  collection(db, 'matches'),
  where('userId', '==', user.uid),
  orderBy('date', 'desc')
);
const querySnapshot = await getDocs(q);
const matchesData = querySnapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));
setMatches(matchesData);
```

## Firestore Database Structure

```
matches (collection)
  └── matchId (document)
      ├── userId: string
      ├── opponent: string
      ├── myScore: string
      ├── opponentScore: string
      ├── courtType: string (hard/clay/grass/indoor)
      ├── result: string (win/loss)
      ├── date: string (YYYY-MM-DD)
      └── createdAt: timestamp
```

## Firestore Security Rules

Add these rules in Firebase Console > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /matches/{matchId} {
      allow read, write: if request.auth != null &&
                          request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
```

## Testing on Physical Device

1. Install **Expo Go** app on your phone (iOS/Android)
2. Run `npm start`
3. Scan the QR code with your phone camera (iOS) or Expo Go app (Android)

## Building for Production

```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

## Future Enhancements

- Match notes/comments
- Photo upload for match results
- Location tracking (GPS for courts)
- Social features (share stats, challenge friends)
- Advanced analytics (performance trends over time)
- Push notifications for match reminders
- Offline mode support

## License

MIT
