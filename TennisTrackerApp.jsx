import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  Alert,
  Animated,
  Keyboard,
  Switch,
} from 'react-native';
import { auth, db } from './firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  deleteUser
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  onSnapshot,
  deleteDoc
} from 'firebase/firestore';
import * as Notifications from 'expo-notifications';

const APP_VERSION = '1.0.0';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Translations
const translations = {
  en: {
    // App
    appTitle: '🎾 Tennis Tracker',

    // Auth
    welcomeBack: 'Welcome back!',
    createAccount: 'Create your account',
    completeProfile: 'Complete your profile',
    email: 'Email',
    password: 'Password',
    login: 'Login',
    register: 'Register',
    next: 'Next',
    back: 'Back',
    alreadyHaveAccount: 'Already have an account? Login',
    noAccount: "Don't have an account? Register",
    completeRegistration: 'Complete Registration',

    // Loading
    loggingIn: 'Logging into your Tennis Universe',
    creatingAccount: 'Creating your Tennis Universe',
    success: 'Success!',

    // Profile
    firstName: 'First Name',
    lastName: 'Last Name',
    age: 'Age',
    mainHand: 'Main Hand',
    left: 'Left',
    right: 'Right',
    racket: 'Tennis Racket',
    racketPlaceholder: 'e.g., Wilson Pro Staff 97',

    // Navigation
    stats: 'Stats',
    history: 'History',
    settings: 'Settings',

    // Settings
    close: 'Close',
    profile: 'Profile',
    notifications: 'Notifications',
    about: 'About',
    appVersion: 'App Version',
    logout: 'Logout',
    saveChanges: 'Save Changes',
    language: 'Language',

    // Notifications
    dailyReminder: 'Daily Reminder',
    reminderSubtitle: 'Get reminded to log your matches',
    reminderTime: 'Reminder Time',
    hour: 'Hour',
    minute: 'Minute',
    reminderPreview: "You'll receive a reminder at",
    daily: 'daily',
    reminderMessage: '"Did you play tennis today? Don\'t forget to log your match!"',

    // Version Info
    whatsNew: "What's New",
    version: 'Version',
    features: 'Features',
    featureMatchTracking: 'Match Tracking',
    featureMatchTrackingDesc: 'Log matches with opponent name, score, court type, and date',
    featureStats: 'Statistics Dashboard',
    featureStatsDesc: 'View win/loss record, win rate, streaks, and monthly performance',
    featureOpponents: 'Opponent Analysis',
    featureOpponentsDesc: 'Track your record against each opponent',
    featureFormats: 'Match Formats',
    featureFormatsDesc: 'Support for one set, two sets, and three sets with super tiebreak',
    featureNotifications: 'Daily Reminders',
    featureNotificationsDesc: 'Set a daily reminder to log your matches',
    featureStrings: 'String Reminder',
    featureStringsDesc: 'Get notified after 4 matches to check your string tension',
    featureProfile: 'Player Profile',
    featureProfileDesc: 'Store your name, age, main hand, and racket info',

    // Stats
    overallPerformance: 'Overall Performance in 2026',
    wins: 'Wins',
    losses: 'Losses',
    winRate: 'Win Rate',
    thisMonth: 'This Month',
    winStreak: 'Win Streak!',
    last5Matches: 'Last 5 Matches',
    mostBeaten: 'Most Beaten Opponents',
    toughestOpponents: 'Toughest Opponents',

    // History
    matchHistory: 'Match History',
    win: 'WIN',
    loss: 'LOSS',

    // Add Match
    addMatch: 'Add Match',
    opponentName: 'Opponent Name',
    matchFormat: 'Match Format',
    oneSet: 'One Set',
    twoSets: 'Two Sets',
    threeSets: 'Three Sets',
    set1Score: 'Set 1 Score',
    set2Score: 'Set 2 Score',
    set3SuperTiebreak: 'Set 3 - Super Tiebreak',
    my: 'My',
    opp: 'Opp',
    courtType: 'Court Type',
    clay: 'Clay',
    hard: 'Hard',
    location: 'Location',
    locationPlaceholder: 'Where did you play? (e.g., Central Park Courts)',
    matchDate: 'Match Date',
    selectDate: 'Select Date',
    day: 'Day',
    month: 'Month',
    year: 'Year',
    today: 'Today',
    yesterday: 'Yesterday',
    done: 'Done',
    cancel: 'Cancel',

    // Alerts
    error: 'Error',
    errorEmailPassword: 'Please fill in email and password',
    errorPasswordLength: 'Password must be at least 6 characters',
    errorFirstLastName: 'Please enter your first and last name',
    errorValidAge: 'Please enter a valid age (5-100)',
    errorRacket: 'Please enter your tennis racket',
    errorOpponentName: 'Add the name of the Opponent',
    errorSet1Score: 'Please fill in the first set score',
    errorSet2Score: 'Please fill in the second set score',
    errorSet3Score: 'Please fill in the third set score',
    errorAllFields: 'Please fill in all fields',
    profileUpdated: 'Profile updated!',

    // Toast Messages
    matchAddedWin: 'Match added - Victory!',
    matchAddedLoss: 'Match added - Better luck next time!',

    // String Notification
    stringNotificationTitle: 'Time for New Strings?',
    stringNotificationText: "You've played 4 matches! Your strings may have lost tension and could affect your game. Consider getting them replaced for optimal performance.",
    gotIt: 'Got it!',

    // Score Errors
    numbersOnly: 'Numbers only',
    minIs: 'Min is',
    maxIs: 'Max is',

    // Language
    off: 'Off',
    at: 'at',
  },
  sr: {
    // App
    appTitle: '🎾 Tenis Tracker',

    // Auth
    welcomeBack: 'Dobrodošli nazad!',
    createAccount: 'Napravite nalog',
    completeProfile: 'Završite profil',
    email: 'Email',
    password: 'Lozinka',
    login: 'Prijava',
    register: 'Registracija',
    next: 'Sledeće',
    back: 'Nazad',
    alreadyHaveAccount: 'Već imate nalog? Prijavite se',
    noAccount: 'Nemate nalog? Registrujte se',
    completeRegistration: 'Završi registraciju',

    // Loading
    loggingIn: 'Prijava u vaš Tenis Svet',
    creatingAccount: 'Kreiranje vašeg Tenis Sveta',
    success: 'Uspešno!',

    // Profile
    firstName: 'Ime',
    lastName: 'Prezime',
    age: 'Godine',
    mainHand: 'Dominantna ruka',
    left: 'Leva',
    right: 'Desna',
    racket: 'Tenis reket',
    racketPlaceholder: 'npr., Wilson Pro Staff 97',

    // Navigation
    stats: 'Statistika',
    history: 'Istorija',
    settings: 'Podešavanja',

    // Settings
    close: 'Zatvori',
    profile: 'Profil',
    notifications: 'Obaveštenja',
    about: 'O aplikaciji',
    appVersion: 'Verzija aplikacije',
    logout: 'Odjava',
    saveChanges: 'Sačuvaj promene',
    language: 'Jezik',

    // Notifications
    dailyReminder: 'Dnevni podsetnik',
    reminderSubtitle: 'Podsetnik za unos mečeva',
    reminderTime: 'Vreme podsetnika',
    hour: 'Sat',
    minute: 'Minut',
    reminderPreview: 'Primiće podsetnik u',
    daily: 'dnevno',
    reminderMessage: '"Da li ste igrali tenis danas? Ne zaboravite da unesete meč!"',

    // Version Info
    whatsNew: 'Šta je novo',
    version: 'Verzija',
    features: 'Mogućnosti',
    featureMatchTracking: 'Praćenje mečeva',
    featureMatchTrackingDesc: 'Unesite mečeve sa imenom protivnika, rezultatom, tipom terena i datumom',
    featureStats: 'Statistička tabla',
    featureStatsDesc: 'Pogledajte pobede/poraze, procenat pobeda, nizove i mesečne performanse',
    featureOpponents: 'Analiza protivnika',
    featureOpponentsDesc: 'Pratite rezultate protiv svakog protivnika',
    featureFormats: 'Formati mečeva',
    featureFormatsDesc: 'Podrška za jedan set, dva seta i tri seta sa super tajbrejkom',
    featureNotifications: 'Dnevni podsetnici',
    featureNotificationsDesc: 'Podesite dnevni podsetnik za unos mečeva',
    featureStrings: 'Podsetnik za žice',
    featureStringsDesc: 'Dobijte obaveštenje posle 4 meča da proverite zatezanje žica',
    featureProfile: 'Profil igrača',
    featureProfileDesc: 'Sačuvajte ime, godine, dominantnu ruku i informacije o reketu',

    // Stats
    overallPerformance: 'Ukupne performanse u 2026',
    wins: 'Pobede',
    losses: 'Porazi',
    winRate: 'Procenat pobeda',
    thisMonth: 'Ovog meseca',
    winStreak: 'Niz pobeda!',
    last5Matches: 'Poslednjih 5 mečeva',
    mostBeaten: 'Najčešće pobeđeni protivnici',
    toughestOpponents: 'Najteži protivnici',

    // History
    matchHistory: 'Istorija mečeva',
    win: 'POBEDA',
    loss: 'PORAZ',

    // Add Match
    addMatch: 'Dodaj meč',
    opponentName: 'Ime protivnika',
    matchFormat: 'Format meča',
    oneSet: 'Jedan set',
    twoSets: 'Dva seta',
    threeSets: 'Tri seta',
    set1Score: 'Rezultat 1. seta',
    set2Score: 'Rezultat 2. seta',
    set3SuperTiebreak: 'Set 3 - Super tajbrejk',
    my: 'Ja',
    opp: 'Prot.',
    courtType: 'Tip terena',
    clay: 'Šljaka',
    hard: 'Beton',
    location: 'Lokacija',
    locationPlaceholder: 'Gdje ste igrali? (npr., Centralni park)',
    matchDate: 'Datum meča',
    selectDate: 'Izaberite datum',
    day: 'Dan',
    month: 'Mesec',
    year: 'Godina',
    today: 'Danas',
    yesterday: 'Juče',
    done: 'Gotovo',
    cancel: 'Otkaži',

    // Alerts
    error: 'Greška',
    errorEmailPassword: 'Molimo unesite email i lozinku',
    errorPasswordLength: 'Lozinka mora imati najmanje 6 karaktera',
    errorFirstLastName: 'Molimo unesite ime i prezime',
    errorValidAge: 'Molimo unesite validne godine (5-100)',
    errorRacket: 'Molimo unesite tenis reket',
    errorOpponentName: 'Dodajte ime protivnika',
    errorSet1Score: 'Molimo unesite rezultat prvog seta',
    errorSet2Score: 'Molimo unesite rezultat drugog seta',
    errorSet3Score: 'Molimo unesite rezultat trećeg seta',
    errorAllFields: 'Molimo popunite sva polja',
    profileUpdated: 'Profil ažuriran!',

    // Toast Messages
    matchAddedWin: 'Meč dodat - Pobeda!',
    matchAddedLoss: 'Meč dodat - Sledeći put bolje!',

    // String Notification
    stringNotificationTitle: 'Vreme za nove žice?',
    stringNotificationText: 'Odigrali ste 4 meča! Vaše žice su možda izgubile zatezanje i mogu uticati na igru. Razmislite o zameni za optimalne performanse.',
    gotIt: 'Razumem!',

    // Score Errors
    numbersOnly: 'Samo brojevi',
    minIs: 'Min je',
    maxIs: 'Maks je',

    // Language
    off: 'Isključeno',
    at: 'u',
  },
};

const TennisTrackerApp = () => {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [user, setUser] = useState(null);
  const [matches, setMatches] = useState([]);
  const [language, setLanguage] = useState('en');
  const [notificationPermission, setNotificationPermission] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Login/Register State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [registerStep, setRegisterStep] = useState(1); // 1 = email/password, 2 = profile info

  // User Profile State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [mainHand, setMainHand] = useState('right');
  const [racket, setRacket] = useState('');

  // Loading Animation State
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Logging into your Tennis Universe');
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [settingsScreen, setSettingsScreen] = useState('main'); // main, profile, notifications, version

  // Notification Settings
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(false);
  const [reminderHour, setReminderHour] = useState(20); // 8 PM default
  const [reminderMinute, setReminderMinute] = useState(0);

  // String replacement notification
  const [userAddedMatchCount, setUserAddedMatchCount] = useState(0);
  const [showStringNotification, setShowStringNotification] = useState(false);
  const [stringNotificationShown, setStringNotificationShown] = useState(false);

  // Add Match State
  const [showAddMatch, setShowAddMatch] = useState(false);
  const [opponentName, setOpponentName] = useState('');
  const [matchFormat, setMatchFormat] = useState('one-set');
  const [set1MyScore, setSet1MyScore] = useState('');
  const [set1OppScore, setSet1OppScore] = useState('');
  const [set2MyScore, setSet2MyScore] = useState('');
  const [set2OppScore, setSet2OppScore] = useState('');
  const [set3MyScore, setSet3MyScore] = useState('');
  const [set3OppScore, setSet3OppScore] = useState('');
  const [courtType, setCourtType] = useState('hard');
  const [location, setLocation] = useState('');
  const [matchDate, setMatchDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Score validation errors
  const [scoreErrors, setScoreErrors] = useState({});

  // Success toast state
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Refs for auto-focus between score inputs
  const set1OppRef = useRef(null);
  const set2MyRef = useRef(null);
  const set2OppRef = useRef(null);
  const set3MyRef = useRef(null);
  const set3OppRef = useRef(null);

  // Translation helper
  const t = (key) => translations[language][key] || key;

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, load their profile
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            email: firebaseUser.email,
            uid: firebaseUser.uid,
            ...userData
          });
          setLanguage(userData.language || 'en');
          setDailyReminderEnabled(userData.dailyReminderEnabled || false);
          setReminderHour(userData.reminderHour || 20);
          setReminderMinute(userData.reminderMinute || 0);
          setUserAddedMatchCount(userData.userAddedMatchCount || 0);
          setStringNotificationShown(userData.stringNotificationShown || false);

          // Also load profile data into form fields
          setFirstName(userData.firstName || '');
          setLastName(userData.lastName || '');
          setAge(userData.age ? userData.age.toString() : '');
          setMainHand(userData.mainHand || 'right');
          setRacket(userData.racket || '');

          setCurrentScreen('home');
          loadMatches(firebaseUser.uid);
        }
        setIsCheckingAuth(false);
      } else {
        // User is signed out
        setUser(null);
        setMatches([]);
        setCurrentScreen('login');
        setIsCheckingAuth(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Schedule notifications when settings change
  useEffect(() => {
    if (user && dailyReminderEnabled) {
      scheduleDailyNotification();
    }
  }, [user, dailyReminderEnabled, reminderHour, reminderMinute]);

  // Get max score based on match format and set number
  const getMaxScore = (format, setNumber) => {
    if (format === 'one-set') return 9;
    if (format === 'two-sets') return 7; // Allow 7-6 tiebreak
    if (format === 'three-sets') {
      return setNumber === 3 ? 10 : 7; // Allow 7-6 tiebreak for sets 1-2
    }
    return 7;
  };

  // Validate score input
  const validateScore = (value, format, setNumber, field) => {
    if (value === '') {
      setScoreErrors(prev => ({ ...prev, [field]: null }));
      return '';
    }

    // Check if it's a number
    if (!/^\d+$/.test(value)) {
      setScoreErrors(prev => ({ ...prev, [field]: t('numbersOnly') }));
      return '';
    }

    const numValue = parseInt(value, 10);
    const maxScore = getMaxScore(format, setNumber);

    if (numValue < 0) {
      setScoreErrors(prev => ({ ...prev, [field]: `${t('minIs')} 0` }));
      return '0';
    }

    if (numValue > maxScore) {
      setScoreErrors(prev => ({ ...prev, [field]: `${t('maxIs')} ${maxScore}` }));
      return maxScore.toString();
    }

    setScoreErrors(prev => ({ ...prev, [field]: null }));
    return value;
  };

  // Calculate result based on scores
  const calculateResult = () => {
    let mySetsWon = 0;
    let oppSetsWon = 0;

    // Set 1
    if (set1MyScore && set1OppScore) {
      if (parseInt(set1MyScore) > parseInt(set1OppScore)) mySetsWon++;
      else if (parseInt(set1OppScore) > parseInt(set1MyScore)) oppSetsWon++;
    }

    // Set 2
    if ((matchFormat === 'two-sets' || matchFormat === 'three-sets') && set2MyScore && set2OppScore) {
      if (parseInt(set2MyScore) > parseInt(set2OppScore)) mySetsWon++;
      else if (parseInt(set2OppScore) > parseInt(set2MyScore)) oppSetsWon++;
    }

    // Set 3
    if (matchFormat === 'three-sets' && set3MyScore && set3OppScore) {
      if (parseInt(set3MyScore) > parseInt(set3OppScore)) mySetsWon++;
      else if (parseInt(set3OppScore) > parseInt(set3MyScore)) oppSetsWon++;
    }

    return mySetsWon > oppSetsWon ? 'win' : 'loss';
  };

  // Handle registration step 1 (email/password)
  const handleRegisterStep1 = () => {
    if (!email || !password) {
      Alert.alert(t('error'), t('errorEmailPassword'));
      return;
    }
    if (password.length < 6) {
      Alert.alert(t('error'), t('errorPasswordLength'));
      return;
    }
    Keyboard.dismiss();
    setRegisterStep(2);
  };

  // Handle registration step 2 (profile info)
  const handleRegisterStep2 = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert(t('error'), t('errorFirstLastName'));
      return;
    }
    if (!age || parseInt(age) < 5 || parseInt(age) > 100) {
      Alert.alert(t('error'), t('errorValidAge'));
      return;
    }
    if (!racket.trim()) {
      Alert.alert(t('error'), t('errorRacket'));
      return;
    }

    Keyboard.dismiss();
    setIsLoggingIn(true);
    setLoadingProgress(0);
    setLoadingText(t('creatingAccount'));

    try {
      // Simulate progress animation
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        setLoadingProgress(Math.min(progress, 90));
      }, 30);

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user profile to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        age: parseInt(age),
        mainHand,
        racket: racket.trim(),
        language: 'en',
        dailyReminderEnabled: false,
        reminderHour: 20,
        reminderMinute: 0,
        userAddedMatchCount: 0,
        stringNotificationShown: false,
        createdAt: new Date().toISOString()
      });

      clearInterval(interval);
      setLoadingProgress(100);
      setLoadingText(t('success'));

      setTimeout(() => {
        setIsLoggingIn(false);
        setRegisterStep(1);
        // Auth state listener will handle navigation
      }, 500);
    } catch (error) {
      setIsLoggingIn(false);
      Alert.alert(t('error'), error.message);
    }
  };

  // Handle login with animation
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('error'), t('errorAllFields'));
      return;
    }

    Keyboard.dismiss();
    setIsLoggingIn(true);
    setLoadingProgress(0);
    setLoadingText(t('loggingIn'));

    try {
      // Simulate progress animation
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        setLoadingProgress(Math.min(progress, 90));
      }, 30);

      // Sign in with Firebase
      await signInWithEmailAndPassword(auth, email, password);

      clearInterval(interval);
      setLoadingProgress(100);
      setLoadingText(t('success'));

      setTimeout(() => {
        setIsLoggingIn(false);
      }, 500);
    } catch (error) {
      setIsLoggingIn(false);
      Alert.alert(t('error'), error.message);
    }
  };

  // Load matches from Firestore
  const loadMatches = async (userId) => {
    try {
      const matchesRef = collection(db, 'matches');
      const q = query(
        matchesRef,
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      const loadedMatches = [];
      querySnapshot.forEach((doc) => {
        loadedMatches.push({ id: doc.id, ...doc.data() });
      });

      // Sort by date in JavaScript (descending - newest first)
      loadedMatches.sort((a, b) => new Date(b.date) - new Date(a.date));

      setMatches(loadedMatches);
    } catch (error) {
      console.error('Error loading matches:', error);
      Alert.alert('Error', 'Failed to load matches: ' + error.message);
    }
  };

  const addMatch = async () => {
    // Validate opponent name first
    if (!opponentName.trim()) {
      Alert.alert(t('error'), t('errorOpponentName'));
      return;
    }

    // Validate scores
    if (!set1MyScore || !set1OppScore) {
      Alert.alert(t('error'), t('errorSet1Score'));
      return;
    }

    if ((matchFormat === 'two-sets' || matchFormat === 'three-sets') && (!set2MyScore || !set2OppScore)) {
      Alert.alert(t('error'), t('errorSet2Score'));
      return;
    }

    if (matchFormat === 'three-sets' && (!set3MyScore || !set3OppScore)) {
      Alert.alert(t('error'), t('errorSet3Score'));
      return;
    }

    // Build score string
    let scoreString = `${set1MyScore}-${set1OppScore}`;
    if (matchFormat === 'two-sets' || matchFormat === 'three-sets') {
      scoreString += `, ${set2MyScore}-${set2OppScore}`;
    }
    if (matchFormat === 'three-sets') {
      scoreString += `, ${set3MyScore}-${set3OppScore}`;
    }

    // Calculate result automatically
    const result = calculateResult();

    const newMatch = {
      opponent: opponentName.trim(),
      myScore: scoreString,
      matchFormat,
      date: matchDate.toISOString().split('T')[0],
      courtType,
      location: location.trim(),
      result,
    };

    try {
      // Add to Firestore
      const docRef = await addDoc(collection(db, 'matches'), {
        ...newMatch,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });

      // Update local state with Firestore ID
      const matchWithId = { ...newMatch, id: docRef.id };
      setMatches([matchWithId, ...matches]);

      // Update user's match count in Firestore
      const newCount = userAddedMatchCount + 1;
      setUserAddedMatchCount(newCount);
      await updateDoc(doc(db, 'users', user.uid), {
        userAddedMatchCount: newCount,
        stringNotificationShown: newCount === 4 ? false : stringNotificationShown
      });

      // Reset form
      setOpponentName('');
      setMatchFormat('one-set');
      setSet1MyScore('');
      setSet1OppScore('');
      setSet2MyScore('');
      setSet2OppScore('');
      setSet3MyScore('');
      setSet3OppScore('');
      setCourtType('hard');
      setLocation('');
      setMatchDate(new Date());
      setScoreErrors({});
      setShowAddMatch(false);

      // Show auto-dismissing success toast
      setSuccessMessage(result === 'win' ? t('matchAddedWin') : t('matchAddedLoss'));
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);

        // Show string notification after 4 matches (only once)
        if (newCount === 4 && !stringNotificationShown) {
          setShowStringNotification(true);
          setStringNotificationShown(true);
        }
      }, 2000);
    } catch (error) {
      Alert.alert(t('error'), 'Failed to add match: ' + error.message);
      return;
    }
  };

  // Calculate statistics
  const calculateStats = () => {
    const totalMatches = matches.length;
    const wins = matches.filter(m => m.result === 'win').length;
    const losses = totalMatches - wins;
    const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : 0;

    const last5 = matches.slice(0, 5);

    let currentStreak = 0;
    for (let match of matches) {
      if (match.result === 'win') currentStreak++;
      else break;
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyMatches = matches.filter(m => {
      const matchDate = new Date(m.date);
      return matchDate.getMonth() === currentMonth && matchDate.getFullYear() === currentYear;
    });
    const monthlyWins = monthlyMatches.filter(m => m.result === 'win').length;
    const monthlyLosses = monthlyMatches.length - monthlyWins;

    const opponentStats = {};
    matches.forEach(match => {
      if (!opponentStats[match.opponent]) {
        opponentStats[match.opponent] = { wins: 0, losses: 0 };
      }
      if (match.result === 'win') {
        opponentStats[match.opponent].wins++;
      } else {
        opponentStats[match.opponent].losses++;
      }
    });

    const mostBeaten = Object.entries(opponentStats)
      .sort((a, b) => b[1].wins - a[1].wins)
      .slice(0, 3);

    const mostLostTo = Object.entries(opponentStats)
      .sort((a, b) => b[1].losses - a[1].losses)
      .slice(0, 3);

    return {
      totalMatches,
      wins,
      losses,
      winRate,
      last5,
      currentStreak,
      monthlyWins,
      monthlyLosses,
      mostBeaten,
      mostLostTo,
    };
  };

  // Date picker state
  const [selectedDay, setSelectedDay] = useState(matchDate.getDate());
  const [selectedMonth, setSelectedMonth] = useState(matchDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(matchDate.getFullYear());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = [2024, 2025, 2026];

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Update matchDate when picker opens
  const openDatePicker = () => {
    setSelectedDay(matchDate.getDate());
    setSelectedMonth(matchDate.getMonth());
    setSelectedYear(matchDate.getFullYear());
    setShowDatePicker(true);
  };

  // Apply selected date
  const applyDate = () => {
    const maxDay = getDaysInMonth(selectedMonth, selectedYear);
    const day = Math.min(selectedDay, maxDay);
    setMatchDate(new Date(selectedYear, selectedMonth, day));
    setShowDatePicker(false);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Clear local state
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setAge('');
      setMainHand('right');
      setRacket('');
      setMatches([]);
      setUserAddedMatchCount(0);
      setStringNotificationShown(false);
      setShowSettings(false);
      setSettingsScreen('main');
      setLanguage('en');
    } catch (error) {
      Alert.alert(t('error'), error.message);
    }
  };

  const handleDeleteAccount = async () => {
    // Show confirmation dialog
    Alert.alert(
      language === 'en' ? 'Delete Account' : 'Obriši Nalog',
      language === 'en'
        ? 'Are you sure you want to delete your account? This action cannot be undone. All your matches and data will be permanently deleted.'
        : 'Da li ste sigurni da želite da obrišete vaš nalog? Ova akcija se ne može poništiti. Svi vaši mečevi i podaci će biti trajno obrisani.',
      [
        {
          text: language === 'en' ? 'Cancel' : 'Otkaži',
          style: 'cancel'
        },
        {
          text: language === 'en' ? 'Delete' : 'Obriši',
          style: 'destructive',
          onPress: async () => {
            try {
              const currentUser = auth.currentUser;
              if (!currentUser) return;

              // Delete all user's matches
              const matchesRef = collection(db, 'matches');
              const q = query(matchesRef, where('userId', '==', currentUser.uid));
              const querySnapshot = await getDocs(q);

              // Delete each match
              for (const docSnapshot of querySnapshot.docs) {
                await deleteDoc(doc(db, 'matches', docSnapshot.id));
              }

              // Delete user document
              await deleteDoc(doc(db, 'users', currentUser.uid));

              // Delete Firebase Auth account
              await deleteUser(currentUser);

              // Clear local state
              setEmail('');
              setPassword('');
              setFirstName('');
              setLastName('');
              setAge('');
              setMainHand('right');
              setRacket('');
              setMatches([]);
              setUserAddedMatchCount(0);
              setStringNotificationShown(false);
              setShowSettings(false);
              setSettingsScreen('main');
              setLanguage('en');
              setCurrentScreen('login');

              Alert.alert(
                language === 'en' ? 'Account Deleted' : 'Nalog Obrisan',
                language === 'en'
                  ? 'Your account and all data have been permanently deleted.'
                  : 'Vaš nalog i svi podaci su trajno obrisani.'
              );
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert(
                language === 'en' ? 'Error' : 'Greška',
                language === 'en'
                  ? 'Failed to delete account. Please try again or contact support.'
                  : 'Neuspešno brisanje naloga. Pokušajte ponovo ili kontaktirajte podršku.'
              );
            }
          }
        }
      ]
    );
  };

  // Language options
  const languageOptions = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'sr', name: 'Srpski', flag: '🇷🇸' },
  ];

  // Request notification permissions
  const requestNotificationPermissions = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    setNotificationPermission(finalStatus === 'granted');
    return finalStatus === 'granted';
  };

  // Schedule daily notification
  const scheduleDailyNotification = async () => {
    // Request permission first
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      Alert.alert(
        t('error'),
        'Notification permission denied. Please enable notifications in your device settings.'
      );
      setDailyReminderEnabled(false);
      return;
    }

    // Cancel all existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (dailyReminderEnabled) {
      // Schedule notification for the set time
      const trigger = {
        hour: reminderHour,
        minute: reminderMinute,
        repeats: true,
      };

      await Notifications.scheduleNotificationAsync({
        content: {
          title: t('appTitle'),
          body: t('reminderMessage').replace(/"/g, ''),
          data: { type: 'daily_reminder' },
        },
        trigger,
      });
    }
  };

  // Update user profile
  const updateProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert(t('error'), t('errorFirstLastName'));
      return;
    }
    if (!age || parseInt(age) < 5 || parseInt(age) > 100) {
      Alert.alert(t('error'), t('errorValidAge'));
      return;
    }

    try {
      const updatedData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        age: parseInt(age),
        mainHand,
        racket: racket.trim()
      };

      await updateDoc(doc(db, 'users', user.uid), updatedData);

      setUser(prev => ({
        ...prev,
        ...updatedData
      }));

      Alert.alert(t('success'), t('profileUpdated'));
      setSettingsScreen('main');
    } catch (error) {
      Alert.alert(t('error'), error.message);
    }
  };

  // Handle language change
  const handleLanguageChange = async (newLanguage) => {
    setLanguage(newLanguage);
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), { language: newLanguage });
      } catch (error) {
        console.error('Error saving language:', error);
      }
    }
    setSettingsScreen('main');
  };

  // Handle notification toggle
  // Add handler for notification toggle
  const handleNotificationToggle = async (value) => {
    setDailyReminderEnabled(value);

    if (value) {
      // Schedule notification when enabled
      await scheduleDailyNotification();
    } else {
      // Cancel all notifications when disabled
      await Notifications.cancelAllScheduledNotificationsAsync();
    }

    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), { dailyReminderEnabled: value });
      } catch (error) {
        console.error('Error saving notification setting:', error);
      }
    }
  };

  // Add handlers for time changes
  const handleReminderHourChange = async (newHour) => {
    setReminderHour(newHour);

    // Reschedule notification with new time
    if (dailyReminderEnabled) {
      // Brief delay to allow state to update
      setTimeout(async () => {
        await scheduleDailyNotification();
      }, 100);
    }

    if (user && dailyReminderEnabled) {
      try {
        await updateDoc(doc(db, 'users', user.uid), { reminderHour: newHour });
      } catch (error) {
        console.error('Error saving reminder hour:', error);
      }
    }
  };

  const handleReminderMinuteChange = async (newMinute) => {
    setReminderMinute(newMinute);

    // Reschedule notification with new time
    if (dailyReminderEnabled) {
      // Brief delay to allow state to update
      setTimeout(async () => {
        await scheduleDailyNotification();
      }, 100);
    }

    if (user && dailyReminderEnabled) {
      try {
        await updateDoc(doc(db, 'users', user.uid), { reminderMinute: newMinute });
      } catch (error) {
        console.error('Error saving reminder minute:', error);
      }
    }
  };

  // Format time for display
  const formatTime = (hour, minute) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };

  // Auth Check Loading Screen
  if (isCheckingAuth) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Text style={styles.loadingEmoji}>🎾</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Loading Screen
  if (isLoggingIn) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Text style={styles.loadingEmoji}>🎾</Text>
          <Text style={styles.loadingTitle}>{loadingText}</Text>

          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${loadingProgress}%` }]} />
          </View>
          <Text style={styles.progressText}>{loadingProgress}%</Text>

          {loadingProgress === 100 && (
            <Text style={styles.successText}>✓</Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Login/Register Screen
  if (!user) {
    // Registration Step 2 - Profile Info
    if (isRegister && registerStep === 2) {
      return (
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.authScrollContainer}>
            <View style={styles.authContainer}>
              <Text style={styles.title}>{t('appTitle')}</Text>
              <Text style={styles.subtitle}>{t('completeProfile')}</Text>

              <TextInput
                style={styles.input}
                placeholder={t('firstName')}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                returnKeyType="next"
              />

              <TextInput
                style={styles.input}
                placeholder={t('lastName')}
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                returnKeyType="next"
              />

              <TextInput
                style={styles.input}
                placeholder={t('age')}
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                maxLength={3}
                returnKeyType="next"
              />

              <Text style={styles.label}>{t('mainHand')}</Text>
              <View style={styles.handButtonGroup}>
                <TouchableOpacity
                  style={[
                    styles.handButton,
                    mainHand === 'left' && styles.selectedHandButton
                  ]}
                  onPress={() => setMainHand('left')}
                >
                  <Text style={[
                    styles.handButtonText,
                    mainHand === 'left' && styles.selectedHandButtonText
                  ]}>{t('left')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.handButton,
                    mainHand === 'right' && styles.selectedHandButton
                  ]}
                  onPress={() => setMainHand('right')}
                >
                  <Text style={[
                    styles.handButtonText,
                    mainHand === 'right' && styles.selectedHandButtonText
                  ]}>{t('right')}</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder={t('racketPlaceholder')}
                value={racket}
                onChangeText={setRacket}
                returnKeyType="done"
              />

              <TouchableOpacity style={styles.primaryButton} onPress={handleRegisterStep2}>
                <Text style={styles.primaryButtonText}>{t('completeRegistration')} →</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setRegisterStep(1)}>
                <Text style={styles.linkText}>← {t('back')}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

    // Login / Registration Step 1
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authContainer}>
          <Text style={styles.title}>{t('appTitle')}</Text>
          <Text style={styles.subtitle}>
            {isRegister ? t('createAccount') : t('welcomeBack')}
          </Text>

          <TextInput
            style={styles.input}
            placeholder={t('email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            textContentType="oneTimeCode"
            returnKeyType="next"
          />

          <TextInput
            style={styles.input}
            placeholder={t('password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            autoCorrect={false}
            autoCapitalize="none"
            spellCheck={false}
            textContentType="oneTimeCode"
            returnKeyType="done"
            onSubmitEditing={isRegister ? handleRegisterStep1 : handleLogin}
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={isRegister ? handleRegisterStep1 : handleLogin}
          >
            <Text style={styles.primaryButtonText}>
              {isRegister ? `${t('next')} →` : `${t('login')} →`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {
            setIsRegister(!isRegister);
            setRegisterStep(1);
          }}>
            <Text style={styles.linkText}>
              {isRegister ? t('alreadyHaveAccount') : t('noAccount')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const stats = calculateStats();

  // Settings Modal
  const renderSettings = () => (
    <Modal
      visible={showSettings}
      animationType="slide"
      transparent={false}
    >
      <SafeAreaView style={styles.settingsContainer}>
        {/* Settings Header */}
        <View style={styles.settingsHeader}>
          <TouchableOpacity onPress={() => {
            if (settingsScreen === 'main') {
              setShowSettings(false);
            } else {
              setSettingsScreen('main');
            }
          }}>
            <Text style={styles.settingsBackText}>
              {settingsScreen === 'main' ? `✕ ${t('close')}` : `← ${t('back')}`}
            </Text>
          </TouchableOpacity>
          <Text style={styles.settingsTitle}>
            {settingsScreen === 'main' && t('settings')}
            {settingsScreen === 'profile' && t('profile')}
            {settingsScreen === 'notifications' && t('notifications')}
            {settingsScreen === 'language' && t('language')}
            {settingsScreen === 'version' && t('whatsNew')}
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.settingsContent}>
          {/* Main Settings Screen */}
          {settingsScreen === 'main' && (
            <>
              <TouchableOpacity
                style={styles.settingsItem}
                onPress={() => {
                  // Load current user data into form
                  setFirstName(user.firstName || '');
                  setLastName(user.lastName || '');
                  setAge(user.age?.toString() || '');
                  setMainHand(user.mainHand || 'right');
                  setRacket(user.racket || '');
                  setSettingsScreen('profile');
                }}
              >
                <Text style={styles.settingsItemIcon}>👤</Text>
                <View style={styles.settingsItemContent}>
                  <Text style={styles.settingsItemTitle}>{t('profile')}</Text>
                  <Text style={styles.settingsItemSubtitle}>
                    {user.firstName} {user.lastName}
                  </Text>
                </View>
                <Text style={styles.settingsItemArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.settingsItem}
                onPress={() => setSettingsScreen('notifications')}
              >
                <Text style={styles.settingsItemIcon}>🔔</Text>
                <View style={styles.settingsItemContent}>
                  <Text style={styles.settingsItemTitle}>{t('notifications')}</Text>
                  <Text style={styles.settingsItemSubtitle}>
                    {dailyReminderEnabled ? `${t('daily')} ${t('at')} ${formatTime(reminderHour, reminderMinute)}` : t('off')}
                  </Text>
                </View>
                <Text style={styles.settingsItemArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.settingsItem}
                onPress={() => setSettingsScreen('language')}
              >
                <Text style={styles.settingsItemIcon}>🌐</Text>
                <View style={styles.settingsItemContent}>
                  <Text style={styles.settingsItemTitle}>{t('language')}</Text>
                  <Text style={styles.settingsItemSubtitle}>
                    {language === 'en' ? 'English' : 'Srpski'}
                  </Text>
                </View>
                <Text style={styles.settingsItemArrow}>›</Text>
              </TouchableOpacity>

              <View style={styles.settingsSection}>
                <Text style={styles.settingsSectionTitle}>{t('about')}</Text>
                <TouchableOpacity
                  style={styles.settingsItem}
                  onPress={() => setSettingsScreen('version')}
                >
                  <Text style={styles.settingsItemIcon}>📱</Text>
                  <View style={styles.settingsItemContent}>
                    <Text style={styles.settingsItemTitle}>{t('appVersion')}</Text>
                    <Text style={styles.settingsItemSubtitle}>{APP_VERSION}</Text>
                  </View>
                  <Text style={styles.settingsItemArrow}>›</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Text style={styles.logoutButtonText}>{t('logout')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteAccountButton}
                onPress={handleDeleteAccount}
              >
                <Text style={styles.deleteAccountButtonText}>
                  {language === 'en' ? 'Delete Account' : 'Obriši Nalog'}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Profile Screen */}
          {settingsScreen === 'profile' && (
            <View style={styles.profileForm}>
              <Text style={styles.formLabel}>{t('firstName')}</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />

              <Text style={styles.formLabel}>{t('lastName')}</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />

              <Text style={styles.formLabel}>{t('age')}</Text>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                maxLength={3}
              />

              <Text style={styles.formLabel}>{t('mainHand')}</Text>
              <View style={styles.handButtonGroup}>
                <TouchableOpacity
                  style={[
                    styles.handButton,
                    mainHand === 'left' && styles.selectedHandButton
                  ]}
                  onPress={() => setMainHand('left')}
                >
                  <Text style={[
                    styles.handButtonText,
                    mainHand === 'left' && styles.selectedHandButtonText
                  ]}>{t('left')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.handButton,
                    mainHand === 'right' && styles.selectedHandButton
                  ]}
                  onPress={() => setMainHand('right')}
                >
                  <Text style={[
                    styles.handButtonText,
                    mainHand === 'right' && styles.selectedHandButtonText
                  ]}>{t('right')}</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.formLabel}>{t('racket')}</Text>
              <TextInput
                style={styles.input}
                value={racket}
                onChangeText={setRacket}
                placeholder={t('racketPlaceholder')}
              />

              <TouchableOpacity style={styles.saveButton} onPress={updateProfile}>
                <Text style={styles.saveButtonText}>{t('saveChanges')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Notifications Screen */}
          {settingsScreen === 'notifications' && (
            <View style={styles.notificationsForm}>
              <View style={styles.notificationToggleRow}>
                <View>
                  <Text style={styles.notificationTitle}>{t('dailyReminder')}</Text>
                  <Text style={styles.notificationSubtitle}>
                    {t('reminderSubtitle')}
                  </Text>
                </View>
                <Switch
                  value={dailyReminderEnabled}
                  onValueChange={handleNotificationToggle}
                  trackColor={{ false: '#e0e0e0', true: '#a5d6a7' }}
                  thumbColor={dailyReminderEnabled ? '#2e7d32' : '#999'}
                />
              </View>

              {dailyReminderEnabled && (
                <>
                  <Text style={styles.formLabel}>{t('reminderTime')}</Text>
                  <View style={styles.timePickerRow}>
                    <View style={styles.timePicker}>
                      <Text style={styles.timePickerLabel}>{t('hour')}</Text>
                      <View style={styles.timeSelector}>
                        <TouchableOpacity
                          style={styles.timeArrowButton}
                          onPress={() => handleReminderHourChange(reminderHour < 23 ? reminderHour + 1 : 0)}
                        >
                          <Text style={styles.timeArrowText}>▲</Text>
                        </TouchableOpacity>
                        <Text style={styles.timeValue}>{reminderHour.toString().padStart(2, '0')}</Text>
                        <TouchableOpacity
                          style={styles.timeArrowButton}
                          onPress={() => handleReminderHourChange(reminderHour > 0 ? reminderHour - 1 : 23)}
                        >
                          <Text style={styles.timeArrowText}>▼</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <Text style={styles.timeColon}>:</Text>

                    <View style={styles.timePicker}>
                      <Text style={styles.timePickerLabel}>{t('minute')}</Text>
                      <View style={styles.timeSelector}>
                        <TouchableOpacity
                          style={styles.timeArrowButton}
                          onPress={() => handleReminderMinuteChange(reminderMinute < 55 ? reminderMinute + 5 : 0)}
                        >
                          <Text style={styles.timeArrowText}>▲</Text>
                        </TouchableOpacity>
                        <Text style={styles.timeValue}>{reminderMinute.toString().padStart(2, '0')}</Text>
                        <TouchableOpacity
                          style={styles.timeArrowButton}
                          onPress={() => handleReminderMinuteChange(reminderMinute > 0 ? reminderMinute - 5 : 55)}
                        >
                          <Text style={styles.timeArrowText}>▼</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.notificationPreview}>
                    {t('reminderPreview')} {formatTime(reminderHour, reminderMinute)} {t('daily')}
                  </Text>
                  <Text style={styles.notificationNote}>
                    {t('reminderMessage')}
                  </Text>
                </>
              )}
            </View>
          )}

          {/* Language Screen */}
          {settingsScreen === 'language' && (
            <View style={styles.languageForm}>
              <TouchableOpacity
                style={styles.languageOption}
                onPress={() => handleLanguageChange('en')}
              >
                <Text style={styles.languageFlag}>🇺🇸</Text>
                <Text style={styles.languageName}>English</Text>
                {language === 'en' && <Text style={styles.languageCheck}>✓</Text>}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.languageOption}
                onPress={() => handleLanguageChange('sr')}
              >
                <Text style={styles.languageFlag}>🇷🇸</Text>
                <Text style={styles.languageName}>Srpski</Text>
                {language === 'sr' && <Text style={styles.languageCheck}>✓</Text>}
              </TouchableOpacity>
            </View>
          )}

          {/* Version Info Screen */}
          {settingsScreen === 'version' && (
            <View style={styles.versionInfo}>
              <View style={styles.versionHeader}>
                <Text style={styles.versionNumber}>{t('version')} {APP_VERSION}</Text>
                <Text style={styles.versionDate}>February 2026</Text>
              </View>

              <Text style={styles.versionSectionTitle}>{t('features')}</Text>

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🎾</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{t('featureMatchTracking')}</Text>
                  <Text style={styles.featureDescription}>{t('featureMatchTrackingDesc')}</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📊</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{t('featureStats')}</Text>
                  <Text style={styles.featureDescription}>{t('featureStatsDesc')}</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>👥</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{t('featureOpponents')}</Text>
                  <Text style={styles.featureDescription}>{t('featureOpponentsDesc')}</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🏆</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{t('featureFormats')}</Text>
                  <Text style={styles.featureDescription}>{t('featureFormatsDesc')}</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🔔</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{t('featureNotifications')}</Text>
                  <Text style={styles.featureDescription}>{t('featureNotificationsDesc')}</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🎸</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{t('featureStrings')}</Text>
                  <Text style={styles.featureDescription}>{t('featureStringsDesc')}</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>👤</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{t('featureProfile')}</Text>
                  <Text style={styles.featureDescription}>{t('featureProfileDesc')}</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  // Main App
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('appTitle')}</Text>
        <TouchableOpacity onPress={() => setShowSettings(true)}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, currentScreen === 'home' && styles.activeTab]}
          onPress={() => setCurrentScreen('home')}
        >
          <Text style={[styles.tabText, currentScreen === 'home' && styles.activeTabText]}>
            {t('stats')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, currentScreen === 'history' && styles.activeTab]}
          onPress={() => setCurrentScreen('history')}
        >
          <Text style={[styles.tabText, currentScreen === 'history' && styles.activeTabText]}>
            {t('history')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {currentScreen === 'home' && (
          <View>
            {/* Overall Stats */}
            <View style={styles.statsCard}>
              <Text style={styles.cardTitle}>{t('overallPerformance')}</Text>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{stats.wins}</Text>
                  <Text style={styles.statLabel}>{t('wins')}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{stats.losses}</Text>
                  <Text style={styles.statLabel}>{t('losses')}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{stats.winRate}%</Text>
                  <Text style={styles.statLabel}>{t('winRate')}</Text>
                </View>
              </View>
            </View>

            {/* Monthly Stats */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('thisMonth')}</Text>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{stats.monthlyWins}</Text>
                  <Text style={styles.statLabel}>{t('wins')}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{stats.monthlyLosses}</Text>
                  <Text style={styles.statLabel}>{t('losses')}</Text>
                </View>
              </View>
            </View>

            {/* Current Streak */}
            {stats.currentStreak > 0 && (
              <View style={styles.streakCard}>
                <Text style={styles.streakEmoji}>🔥</Text>
                <Text style={styles.streakText}>
                  {stats.currentStreak} {t('winStreak')}
                </Text>
              </View>
            )}

            {/* Last 5 Matches */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('last5Matches')}</Text>
              {stats.last5.map((match) => (
                <View key={match.id} style={styles.matchItem}>
                  <Text style={styles.matchOpponent}>{match.opponent}</Text>
                  <Text style={styles.matchScore}>
                    {match.myScore}
                  </Text>
                  <View style={[
                    styles.resultBadge,
                    match.result === 'win' ? styles.winBadge : styles.lossBadge
                  ]}>
                    <Text style={styles.resultText}>
                      {match.result === 'win' ? 'W' : 'L'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Opponent Stats */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('mostBeaten')}</Text>
              {stats.mostBeaten.map(([opponent, record]) => (
                <View key={opponent} style={styles.opponentItem}>
                  <Text style={styles.opponentName}>{opponent}</Text>
                  <Text style={styles.opponentRecord}>{record.wins}W - {record.losses}L</Text>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('toughestOpponents')}</Text>
              {stats.mostLostTo.map(([opponent, record]) => (
                <View key={opponent} style={styles.opponentItem}>
                  <Text style={styles.opponentName}>{opponent}</Text>
                  <Text style={styles.opponentRecord}>{record.wins}W - {record.losses}L</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {currentScreen === 'history' && (
          <View>
            <Text style={styles.sectionTitle}>{t('matchHistory')}</Text>
            {matches.map((match) => (
              <View key={match.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyOpponent}>{match.opponent}</Text>
                  <Text style={styles.historyDate}>{match.date}</Text>
                </View>
                <View style={styles.historyDetails}>
                  <Text style={styles.historyScore}>
                    {match.myScore}
                  </Text>
                  <Text style={styles.historyCourt}>{t(match.courtType)}</Text>
                  <View style={[
                    styles.resultBadge,
                    match.result === 'win' ? styles.winBadge : styles.lossBadge
                  ]}>
                    <Text style={styles.resultText}>
                      {match.result === 'win' ? t('win') : t('loss')}
                    </Text>
                  </View>
                </View>
                {match.location && (
                  <Text style={styles.historyLocation}>📍 {match.location}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Bottom padding for FAB */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Add Button - Larger */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddMatch(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add Match Modal */}
      <Modal
        visible={showAddMatch}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <ScrollView
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps='handled'
          >
            <View style={styles.modalContent}>

              {/* Date Picker View */}
              {showDatePicker ? (
                <>
                  <Text style={styles.modalTitle}>{t('selectDate')}</Text>

                  {/* Day Selector */}
                  <View style={styles.dateRow}>
                    <Text style={styles.dateLabel}>{t('day')}</Text>
                    <View style={styles.dateSelector}>
                      <TouchableOpacity
                        style={styles.arrowButton}
                        onPress={() => {
                          const maxDay = getDaysInMonth(selectedMonth, selectedYear);
                          setSelectedDay(selectedDay > 1 ? selectedDay - 1 : maxDay);
                        }}
                      >
                        <Text style={styles.arrowText}>◀</Text>
                      </TouchableOpacity>
                      <Text style={styles.dateValue}>{selectedDay}</Text>
                      <TouchableOpacity
                        style={styles.arrowButton}
                        onPress={() => {
                          const maxDay = getDaysInMonth(selectedMonth, selectedYear);
                          setSelectedDay(selectedDay < maxDay ? selectedDay + 1 : 1);
                        }}
                      >
                        <Text style={styles.arrowText}>▶</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Month Selector */}
                  <View style={styles.dateRow}>
                    <Text style={styles.dateLabel}>{t('month')}</Text>
                    <View style={styles.dateSelector}>
                      <TouchableOpacity
                        style={styles.arrowButton}
                        onPress={() => {
                          const newMonth = selectedMonth > 0 ? selectedMonth - 1 : 11;
                          setSelectedMonth(newMonth);
                          const maxDay = getDaysInMonth(newMonth, selectedYear);
                          if (selectedDay > maxDay) setSelectedDay(maxDay);
                        }}
                      >
                        <Text style={styles.arrowText}>◀</Text>
                      </TouchableOpacity>
                      <Text style={styles.dateValue}>{monthNames[selectedMonth]}</Text>
                      <TouchableOpacity
                        style={styles.arrowButton}
                        onPress={() => {
                          const newMonth = selectedMonth < 11 ? selectedMonth + 1 : 0;
                          setSelectedMonth(newMonth);
                          const maxDay = getDaysInMonth(newMonth, selectedYear);
                          if (selectedDay > maxDay) setSelectedDay(maxDay);
                        }}
                      >
                        <Text style={styles.arrowText}>▶</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Year Selector */}
                  <View style={styles.dateRow}>
                    <Text style={styles.dateLabel}>{t('year')}</Text>
                    <View style={styles.dateSelector}>
                      <TouchableOpacity
                        style={styles.arrowButton}
                        onPress={() => {
                          const idx = years.indexOf(selectedYear);
                          const newIdx = idx > 0 ? idx - 1 : years.length - 1;
                          setSelectedYear(years[newIdx]);
                        }}
                      >
                        <Text style={styles.arrowText}>◀</Text>
                      </TouchableOpacity>
                      <Text style={styles.dateValue}>{selectedYear}</Text>
                      <TouchableOpacity
                        style={styles.arrowButton}
                        onPress={() => {
                          const idx = years.indexOf(selectedYear);
                          const newIdx = idx < years.length - 1 ? idx + 1 : 0;
                          setSelectedYear(years[newIdx]);
                        }}
                      >
                        <Text style={styles.arrowText}>▶</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Quick Date Buttons */}
                  <View style={styles.quickDateButtons}>
                    <TouchableOpacity
                      style={styles.quickDateButton}
                      onPress={() => {
                        const today = new Date();
                        setSelectedDay(today.getDate());
                        setSelectedMonth(today.getMonth());
                        setSelectedYear(today.getFullYear());
                      }}
                    >
                      <Text style={styles.quickDateText}>{t('today')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.quickDateButton}
                      onPress={() => {
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        setSelectedDay(yesterday.getDate());
                        setSelectedMonth(yesterday.getMonth());
                        setSelectedYear(yesterday.getFullYear());
                      }}
                    >
                      <Text style={styles.quickDateText}>{t('yesterday')}</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[styles.button, styles.addButton, { marginTop: 20 }]}
                    onPress={applyDate}
                  >
                    <Text style={styles.addButtonText}>{t('done')}</Text>
                  </TouchableOpacity>
                </>
              ) : (
              <>
              <Text style={styles.modalTitle}>{t('addMatch')}</Text>

              <TextInput
                style={styles.input}
                placeholder={t('opponentName')}
                value={opponentName}
                onChangeText={setOpponentName}
                returnKeyType="done"
                blurOnSubmit={true}
              />

              <Text style={styles.label}>{t('matchFormat')}</Text>
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    matchFormat === 'one-set' && styles.selectedOption
                  ]}
                  onPress={() => {
                    setMatchFormat('one-set');
                    setSet2MyScore('');
                    setSet2OppScore('');
                    setSet3MyScore('');
                    setSet3OppScore('');
                    setScoreErrors({});
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    matchFormat === 'one-set' && styles.selectedOptionText
                  ]}>
                    {t('oneSet')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    matchFormat === 'two-sets' && styles.selectedOption
                  ]}
                  onPress={() => {
                    setMatchFormat('two-sets');
                    setSet3MyScore('');
                    setSet3OppScore('');
                    setScoreErrors({});
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    matchFormat === 'two-sets' && styles.selectedOptionText
                  ]}>
                    {t('twoSets')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    matchFormat === 'three-sets' && styles.selectedOption
                  ]}
                  onPress={() => {
                    setMatchFormat('three-sets');
                    setScoreErrors({});
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    matchFormat === 'three-sets' && styles.selectedOptionText
                  ]}>
                    {t('threeSets')}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>{t('set1Score')}</Text>
              <View style={styles.scoreRow}>
                <View style={styles.scoreInputContainer}>
                  <TextInput
                    style={[styles.input, styles.scoreInput, scoreErrors.set1My && styles.inputError]}
                    placeholder={t('my')}
                    value={set1MyScore}
                    onChangeText={(text) => {
                      const validated = validateScore(text, matchFormat, 1, 'set1My');
                      setSet1MyScore(validated);
                      if (validated.length === 1) set1OppRef.current?.focus();
                    }}
                    keyboardType="number-pad"
                    returnKeyType="done"
                    blurOnSubmit={true}
                    maxLength={1}
                  />
                  {scoreErrors.set1My && <Text style={styles.errorText}>{scoreErrors.set1My}</Text>}
                </View>
                <Text style={styles.scoreDivider}>-</Text>
                <View style={styles.scoreInputContainer}>
                  <TextInput
                    ref={set1OppRef}
                    style={[styles.input, styles.scoreInput, scoreErrors.set1Opp && styles.inputError]}
                    placeholder={t('opp')}
                    value={set1OppScore}
                    onChangeText={(text) => {
                      const validated = validateScore(text, matchFormat, 1, 'set1Opp');
                      setSet1OppScore(validated);
                      if (validated.length === 1 && (matchFormat === 'two-sets' || matchFormat === 'three-sets')) {
                        set2MyRef.current?.focus();
                      }
                    }}
                    keyboardType="number-pad"
                    returnKeyType="done"
                    blurOnSubmit={true}
                    maxLength={1}
                  />
                  {scoreErrors.set1Opp && <Text style={styles.errorText}>{scoreErrors.set1Opp}</Text>}
                </View>
              </View>

              {(matchFormat === 'two-sets' || matchFormat === 'three-sets') && (
                <>
                  <Text style={styles.label}>{t('set2Score')}</Text>
                  <View style={styles.scoreRow}>
                    <View style={styles.scoreInputContainer}>
                      <TextInput
                        ref={set2MyRef}
                        style={[styles.input, styles.scoreInput, scoreErrors.set2My && styles.inputError]}
                        placeholder={t('my')}
                        value={set2MyScore}
                        onChangeText={(text) => {
                          const validated = validateScore(text, matchFormat, 2, 'set2My');
                          setSet2MyScore(validated);
                          if (validated.length === 1) set2OppRef.current?.focus();
                        }}
                        keyboardType="number-pad"
                        returnKeyType="done"
                        blurOnSubmit={true}
                        maxLength={1}
                      />
                      {scoreErrors.set2My && <Text style={styles.errorText}>{scoreErrors.set2My}</Text>}
                    </View>
                    <Text style={styles.scoreDivider}>-</Text>
                    <View style={styles.scoreInputContainer}>
                      <TextInput
                        ref={set2OppRef}
                        style={[styles.input, styles.scoreInput, scoreErrors.set2Opp && styles.inputError]}
                        placeholder={t('opp')}
                        value={set2OppScore}
                        onChangeText={(text) => {
                          const validated = validateScore(text, matchFormat, 2, 'set2Opp');
                          setSet2OppScore(validated);
                          if (validated.length === 1 && matchFormat === 'three-sets') {
                            set3MyRef.current?.focus();
                          }
                        }}
                        keyboardType="number-pad"
                        returnKeyType="done"
                        blurOnSubmit={true}
                        maxLength={1}
                      />
                      {scoreErrors.set2Opp && <Text style={styles.errorText}>{scoreErrors.set2Opp}</Text>}
                    </View>
                  </View>
                </>
              )}

              {matchFormat === 'three-sets' && (
                <>
                  <Text style={styles.label}>{t('set3SuperTiebreak')}</Text>
                  <View style={styles.scoreRow}>
                    <View style={styles.scoreInputContainer}>
                      <TextInput
                        ref={set3MyRef}
                        style={[styles.input, styles.scoreInput, scoreErrors.set3My && styles.inputError]}
                        placeholder={t('my')}
                        value={set3MyScore}
                        onChangeText={(text) => {
                          const validated = validateScore(text, matchFormat, 3, 'set3My');
                          setSet3MyScore(validated);
                          if (validated.length >= 1) set3OppRef.current?.focus();
                        }}
                        keyboardType="number-pad"
                        returnKeyType="done"
                        blurOnSubmit={true}
                        maxLength={2}
                      />
                      {scoreErrors.set3My && <Text style={styles.errorText}>{scoreErrors.set3My}</Text>}
                    </View>
                    <Text style={styles.scoreDivider}>-</Text>
                    <View style={styles.scoreInputContainer}>
                      <TextInput
                        ref={set3OppRef}
                        style={[styles.input, styles.scoreInput, scoreErrors.set3Opp && styles.inputError]}
                        placeholder={t('opp')}
                        value={set3OppScore}
                        onChangeText={(text) => setSet3OppScore(validateScore(text, matchFormat, 3, 'set3Opp'))}
                        keyboardType="number-pad"
                        returnKeyType="done"
                        blurOnSubmit={true}
                        maxLength={2}
                      />
                      {scoreErrors.set3Opp && <Text style={styles.errorText}>{scoreErrors.set3Opp}</Text>}
                    </View>
                  </View>
                </>
              )}

              <Text style={styles.label}>{t('courtType')}</Text>
              <View style={styles.courtButtonGroup}>
                <TouchableOpacity
                  style={[
                    styles.courtButton,
                    styles.clayButton,
                    courtType === 'clay' && styles.selectedCourtButton
                  ]}
                  onPress={() => setCourtType('clay')}
                >
                  <Text style={styles.courtButtonText}>
                    {t('clay')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.courtButton,
                    styles.hardButton,
                    courtType === 'hard' && styles.selectedCourtButton
                  ]}
                  onPress={() => setCourtType('hard')}
                >
                  <Text style={styles.courtButtonText}>
                    {t('hard')}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>{t('matchDate')}</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={openDatePicker}
              >
                <Text style={styles.dateButtonText}>
                  {matchDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </TouchableOpacity>

              <Text style={styles.label}>{t('location')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('locationPlaceholder')}
                value={location}
                onChangeText={setLocation}
                returnKeyType="done"
                blurOnSubmit={true}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setShowAddMatch(false);
                    setScoreErrors({});
                  }}
                >
                  <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.addButton]}
                  onPress={addMatch}
                >
                  <Text style={styles.addButtonText}>{t('addMatch')}</Text>
                </TouchableOpacity>
              </View>
              </>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* String Replacement Notification Modal */}
      <Modal
        visible={showStringNotification}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.stringNotificationModal}>
            <Text style={styles.stringNotificationEmoji}>🎾</Text>
            <Text style={styles.stringNotificationTitle}>{t('stringNotificationTitle')}</Text>
            <Text style={styles.stringNotificationText}>
              {t('stringNotificationText')}
            </Text>
            <TouchableOpacity
              style={styles.stringNotificationButton}
              onPress={() => setShowStringNotification(false)}
            >
              <Text style={styles.stringNotificationButtonText}>{t('gotIt')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
      {renderSettings()}

      {/* Success Toast */}
      {showSuccessToast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{successMessage}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  // Loading Screen Styles
  loadingContainer: {
    flex: 1,
    backgroundColor: '#2e7d32',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingEmoji: {
    fontSize: 80,
    marginBottom: 30,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 18,
    color: '#fff',
    marginTop: 15,
    fontWeight: 'bold',
  },
  successText: {
    fontSize: 60,
    color: '#fff',
    marginTop: 30,
  },
  // Auth Styles
  authScrollContainer: {
    flexGrow: 1,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  inputError: {
    borderWidth: 2,
    borderColor: '#f44336',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginTop: 10,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginTop: 15,
  },
  handButtonGroup: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  handButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  selectedHandButton: {
    borderColor: '#2e7d32',
    backgroundColor: '#e8f5e9',
  },
  handButtonText: {
    fontSize: 16,
    color: '#666',
  },
  selectedHandButtonText: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  primaryButton: {
    backgroundColor: '#2e7d32',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    textAlign: 'center',
    color: '#2e7d32',
    marginTop: 20,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  settingsIcon: {
    fontSize: 24,
  },
  // Settings Styles
  settingsContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  settingsBackText: {
    fontSize: 16,
    color: '#2e7d32',
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  settingsContent: {
    flex: 1,
    padding: 20,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  settingsItemIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  settingsItemContent: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  settingsItemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  settingsItemArrow: {
    fontSize: 24,
    color: '#ccc',
  },
  settingsSection: {
    marginTop: 20,
  },
  settingsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
    marginLeft: 5,
  },
  logoutButton: {
    backgroundColor: '#ffebee',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  },
  logoutButtonText: {
    color: '#d32f2f',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteAccountButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#d32f2f',
  },
  deleteAccountButtonText: {
    color: '#d32f2f',
    fontSize: 14,
    fontWeight: '600',
  },
  profileForm: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
  },
  saveButton: {
    backgroundColor: '#2e7d32',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Notifications Settings
  notificationsForm: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
  },
  notificationToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  notificationSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  timePicker: {
    alignItems: 'center',
  },
  timePickerLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  timeSelector: {
    alignItems: 'center',
  },
  timeArrowButton: {
    padding: 10,
  },
  timeArrowText: {
    fontSize: 18,
    color: '#2e7d32',
  },
  timeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 60,
    textAlign: 'center',
  },
  timeColon: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 10,
  },
  notificationPreview: {
    fontSize: 14,
    color: '#2e7d32',
    textAlign: 'center',
    marginTop: 10,
  },
  notificationNote: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  // Language Settings
  languageForm: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  languageFlag: {
    fontSize: 32,
    marginRight: 15,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  languageCheck: {
    fontSize: 24,
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#2e7d32',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  streakCard: {
    backgroundColor: '#fff3e0',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ff9800',
  },
  streakEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  streakText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e65100',
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  matchOpponent: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  matchScore: {
    fontSize: 16,
    color: '#666',
    marginRight: 15,
  },
  resultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    minWidth: 40,
    alignItems: 'center',
  },
  winBadge: {
    backgroundColor: '#4caf50',
  },
  lossBadge: {
    backgroundColor: '#f44336',
  },
  resultText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  opponentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  opponentName: {
    fontSize: 16,
    color: '#333',
  },
  opponentRecord: {
    fontSize: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  historyOpponent: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  historyDate: {
    fontSize: 14,
    color: '#999',
  },
  historyDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  historyScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  historyCourt: {
    fontSize: 14,
    color: '#999',
    textTransform: 'capitalize',
  },
  historyLocation: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  // Larger FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  fabText: {
    fontSize: 40,
    color: '#fff',
    fontWeight: '300',
    marginTop: -2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  scoreInputContainer: {
    flex: 1,
  },
  scoreInput: {
    marginBottom: 5,
    textAlign: 'center',
  },
  scoreDivider: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 10,
    marginTop: 12,
    color: '#666',
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 5,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
  },
  selectedOption: {
    borderColor: '#2e7d32',
    backgroundColor: '#e8f5e9',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedOptionText: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  // Court Type Buttons - Full Width
  courtButtonGroup: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  courtButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  clayButton: {
    backgroundColor: '#C04000',
  },
  hardButton: {
    backgroundColor: '#0085C7',
  },
  selectedCourtButton: {
    borderColor: '#2e7d32',
  },
  courtButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#2e7d32',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateButton: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  // Date Picker Styles
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    width: 60,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  arrowButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 18,
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  dateValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 100,
    textAlign: 'center',
  },
  quickDateButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  quickDateButton: {
    flex: 1,
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickDateText: {
    color: '#2e7d32',
    fontSize: 14,
    fontWeight: '600',
  },
  // String Notification Modal
  stringNotificationModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  stringNotificationEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  stringNotificationTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  stringNotificationText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 25,
  },
  stringNotificationButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  stringNotificationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Toast styles
  toast: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: '#2e7d32',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  toastText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Version Info Styles
  versionInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  versionHeader: {
    alignItems: 'center',
    marginBottom: 25,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  versionNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  versionDate: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  versionSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 15,
    width: 35,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default TennisTrackerApp;
