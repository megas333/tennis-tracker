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

const APP_VERSION = '1.0.0';

const TennisTrackerApp = () => {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [user, setUser] = useState(null);
  const [matches, setMatches] = useState([]);

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
      setScoreErrors(prev => ({ ...prev, [field]: 'Numbers only' }));
      return '';
    }

    const numValue = parseInt(value, 10);
    const maxScore = getMaxScore(format, setNumber);

    if (numValue < 0) {
      setScoreErrors(prev => ({ ...prev, [field]: 'Min is 0' }));
      return '0';
    }

    if (numValue > maxScore) {
      setScoreErrors(prev => ({ ...prev, [field]: `Max is ${maxScore}` }));
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
      Alert.alert('Error', 'Please fill in email and password');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    Keyboard.dismiss();
    setRegisterStep(2);
  };

  // Handle registration step 2 (profile info)
  const handleRegisterStep2 = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Error', 'Please enter your first and last name');
      return;
    }
    if (!age || parseInt(age) < 5 || parseInt(age) > 100) {
      Alert.alert('Error', 'Please enter a valid age (5-100)');
      return;
    }
    if (!racket.trim()) {
      Alert.alert('Error', 'Please enter your tennis racket');
      return;
    }

    // Complete registration
    Keyboard.dismiss();
    setIsLoggingIn(true);
    setLoadingProgress(0);
    setLoadingText('Creating your Tennis Universe');

    let progress = 0;
    const totalDuration = 1200;
    const intervalTime = 30;
    const increment = 100 / (totalDuration / intervalTime);

    const interval = setInterval(() => {
      progress += increment;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setLoadingProgress(100);
        setLoadingText('Success!');

        setTimeout(() => {
          setUser({
            email,
            uid: 'mock-uid',
            firstName,
            lastName,
            age: parseInt(age),
            mainHand,
            racket,
          });
          setCurrentScreen('home');
          setIsLoggingIn(false);
          setRegisterStep(1);
          loadMatches();
        }, 500);
      } else {
        setLoadingProgress(Math.floor(progress));
      }
    }, intervalTime);
  };

  // Handle login with animation
  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    Keyboard.dismiss();
    setIsLoggingIn(true);
    setLoadingProgress(0);
    setLoadingText('Logging into your Tennis Universe');

    let progress = 0;
    const totalDuration = 1200;
    const intervalTime = 30;
    const increment = 100 / (totalDuration / intervalTime);

    const interval = setInterval(() => {
      progress += increment;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setLoadingProgress(100);
        setLoadingText('Success!');

        setTimeout(() => {
          // Mock user with profile data
          setUser({
            email,
            uid: 'mock-uid',
            firstName: 'Tennis',
            lastName: 'Player',
            age: 30,
            mainHand: 'right',
            racket: 'Wilson Pro Staff 97',
          });
          setCurrentScreen('home');
          setIsLoggingIn(false);
          loadMatches();
        }, 500);
      } else {
        setLoadingProgress(Math.floor(progress));
      }
    }, intervalTime);
  };

  // Mock data loading
  const loadMatches = () => {
    const mockMatches = [
      { id: '1', opponent: 'John Smith', myScore: '6-4', matchFormat: 'one-set', date: '2026-02-01', courtType: 'hard', result: 'win' },
      { id: '2', opponent: 'Mike Johnson', myScore: '4-6, 6-7', matchFormat: 'two-sets', date: '2026-02-02', courtType: 'clay', result: 'loss' },
      { id: '3', opponent: 'John Smith', myScore: '6-3, 7-5', matchFormat: 'two-sets', date: '2026-02-03', courtType: 'hard', result: 'win' },
      { id: '4', opponent: 'Sarah Williams', myScore: '7-5', matchFormat: 'one-set', date: '2026-02-04', courtType: 'clay', result: 'win' },
      { id: '5', opponent: 'Mike Johnson', myScore: '6-7, 6-4, 10-8', matchFormat: 'three-sets', date: '2026-02-05', courtType: 'hard', result: 'win' },
    ];
    setMatches(mockMatches);
  };

  const addMatch = () => {
    // Validate opponent name first
    if (!opponentName.trim()) {
      Alert.alert('Error', 'Add the name of the Opponent');
      return;
    }

    // Validate scores
    if (!set1MyScore || !set1OppScore) {
      Alert.alert('Error', 'Please fill in the first set score');
      return;
    }

    if ((matchFormat === 'two-sets' || matchFormat === 'three-sets') && (!set2MyScore || !set2OppScore)) {
      Alert.alert('Error', 'Please fill in the second set score');
      return;
    }

    if (matchFormat === 'three-sets' && (!set3MyScore || !set3OppScore)) {
      Alert.alert('Error', 'Please fill in the third set score');
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
      id: Date.now().toString(),
      opponent: opponentName.trim(),
      myScore: scoreString,
      matchFormat,
      date: matchDate.toISOString().split('T')[0],
      courtType,
      result,
    };

    setMatches([newMatch, ...matches]);

    // Track user-added matches for string notification
    const newCount = userAddedMatchCount + 1;
    setUserAddedMatchCount(newCount);

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
    setMatchDate(new Date());
    setScoreErrors({});
    setShowAddMatch(false);

    // Show auto-dismissing success toast
    setSuccessMessage(result === 'win' ? 'Match added - Victory!' : 'Match added - Better luck next time!');
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);

      // Show string notification after 4 matches (only once)
      if (newCount === 4 && !stringNotificationShown) {
        setShowStringNotification(true);
        setStringNotificationShown(true);
      }
    }, 2000);
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
  const handleLogout = () => {
    setUser(null);
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
    setCurrentScreen('login');
  };

  // Update user profile
  const updateProfile = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Error', 'Please enter your first and last name');
      return;
    }
    if (!age || parseInt(age) < 5 || parseInt(age) > 100) {
      Alert.alert('Error', 'Please enter a valid age (5-100)');
      return;
    }

    setUser(prev => ({
      ...prev,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      age: parseInt(age),
      mainHand,
      racket: racket.trim(),
    }));

    Alert.alert('Success', 'Profile updated!');
    setSettingsScreen('main');
  };

  // Format time for display
  const formatTime = (hour, minute) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };

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
              <Text style={styles.title}>🎾 Tennis Tracker</Text>
              <Text style={styles.subtitle}>Complete your profile</Text>

              <TextInput
                style={styles.input}
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                returnKeyType="next"
              />

              <TextInput
                style={styles.input}
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                returnKeyType="next"
              />

              <TextInput
                style={styles.input}
                placeholder="Age"
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                maxLength={3}
                returnKeyType="next"
              />

              <Text style={styles.label}>Main Hand</Text>
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
                  ]}>Left</Text>
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
                  ]}>Right</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Tennis Racket (e.g., Wilson Pro Staff 97)"
                value={racket}
                onChangeText={setRacket}
                returnKeyType="done"
              />

              <TouchableOpacity style={styles.primaryButton} onPress={handleRegisterStep2}>
                <Text style={styles.primaryButtonText}>Complete Registration →</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setRegisterStep(1)}>
                <Text style={styles.linkText}>← Back</Text>
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
          <Text style={styles.title}>🎾 Tennis Tracker</Text>
          <Text style={styles.subtitle}>
            {isRegister ? 'Create your account' : 'Welcome back!'}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
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
            placeholder="Password"
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
              {isRegister ? 'Next →' : 'Login →'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {
            setIsRegister(!isRegister);
            setRegisterStep(1);
          }}>
            <Text style={styles.linkText}>
              {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
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
              {settingsScreen === 'main' ? '✕ Close' : '← Back'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.settingsTitle}>
            {settingsScreen === 'main' && 'Settings'}
            {settingsScreen === 'profile' && 'Profile'}
            {settingsScreen === 'notifications' && 'Notifications'}
            {settingsScreen === 'version' && 'What\'s New'}
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
                  <Text style={styles.settingsItemTitle}>Profile</Text>
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
                  <Text style={styles.settingsItemTitle}>Notifications</Text>
                  <Text style={styles.settingsItemSubtitle}>
                    {dailyReminderEnabled ? `Daily at ${formatTime(reminderHour, reminderMinute)}` : 'Off'}
                  </Text>
                </View>
                <Text style={styles.settingsItemArrow}>›</Text>
              </TouchableOpacity>

              <View style={styles.settingsSection}>
                <Text style={styles.settingsSectionTitle}>About</Text>
                <TouchableOpacity
                  style={styles.settingsItem}
                  onPress={() => setSettingsScreen('version')}
                >
                  <Text style={styles.settingsItemIcon}>📱</Text>
                  <View style={styles.settingsItemContent}>
                    <Text style={styles.settingsItemTitle}>App Version</Text>
                    <Text style={styles.settingsItemSubtitle}>{APP_VERSION}</Text>
                  </View>
                  <Text style={styles.settingsItemArrow}>›</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Profile Screen */}
          {settingsScreen === 'profile' && (
            <View style={styles.profileForm}>
              <Text style={styles.formLabel}>First Name</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />

              <Text style={styles.formLabel}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />

              <Text style={styles.formLabel}>Age</Text>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                maxLength={3}
              />

              <Text style={styles.formLabel}>Main Hand</Text>
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
                  ]}>Left</Text>
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
                  ]}>Right</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.formLabel}>Tennis Racket</Text>
              <TextInput
                style={styles.input}
                value={racket}
                onChangeText={setRacket}
                placeholder="e.g., Wilson Pro Staff 97"
              />

              <TouchableOpacity style={styles.saveButton} onPress={updateProfile}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Notifications Screen */}
          {settingsScreen === 'notifications' && (
            <View style={styles.notificationsForm}>
              <View style={styles.notificationToggleRow}>
                <View>
                  <Text style={styles.notificationTitle}>Daily Reminder</Text>
                  <Text style={styles.notificationSubtitle}>
                    Get reminded to log your matches
                  </Text>
                </View>
                <Switch
                  value={dailyReminderEnabled}
                  onValueChange={setDailyReminderEnabled}
                  trackColor={{ false: '#e0e0e0', true: '#a5d6a7' }}
                  thumbColor={dailyReminderEnabled ? '#2e7d32' : '#999'}
                />
              </View>

              {dailyReminderEnabled && (
                <>
                  <Text style={styles.formLabel}>Reminder Time</Text>
                  <View style={styles.timePickerRow}>
                    <View style={styles.timePicker}>
                      <Text style={styles.timePickerLabel}>Hour</Text>
                      <View style={styles.timeSelector}>
                        <TouchableOpacity
                          style={styles.timeArrowButton}
                          onPress={() => setReminderHour(reminderHour < 23 ? reminderHour + 1 : 0)}
                        >
                          <Text style={styles.timeArrowText}>▲</Text>
                        </TouchableOpacity>
                        <Text style={styles.timeValue}>{reminderHour.toString().padStart(2, '0')}</Text>
                        <TouchableOpacity
                          style={styles.timeArrowButton}
                          onPress={() => setReminderHour(reminderHour > 0 ? reminderHour - 1 : 23)}
                        >
                          <Text style={styles.timeArrowText}>▼</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <Text style={styles.timeColon}>:</Text>

                    <View style={styles.timePicker}>
                      <Text style={styles.timePickerLabel}>Minute</Text>
                      <View style={styles.timeSelector}>
                        <TouchableOpacity
                          style={styles.timeArrowButton}
                          onPress={() => setReminderMinute(reminderMinute < 55 ? reminderMinute + 5 : 0)}
                        >
                          <Text style={styles.timeArrowText}>▲</Text>
                        </TouchableOpacity>
                        <Text style={styles.timeValue}>{reminderMinute.toString().padStart(2, '0')}</Text>
                        <TouchableOpacity
                          style={styles.timeArrowButton}
                          onPress={() => setReminderMinute(reminderMinute > 0 ? reminderMinute - 5 : 55)}
                        >
                          <Text style={styles.timeArrowText}>▼</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.notificationPreview}>
                    You'll receive a reminder at {formatTime(reminderHour, reminderMinute)} daily
                  </Text>
                  <Text style={styles.notificationNote}>
                    "Did you play tennis today? Don't forget to log your match!"
                  </Text>
                </>
              )}
            </View>
          )}

          {/* Version Info Screen */}
          {settingsScreen === 'version' && (
            <View style={styles.versionInfo}>
              <View style={styles.versionHeader}>
                <Text style={styles.versionNumber}>Version {APP_VERSION}</Text>
                <Text style={styles.versionDate}>February 2026</Text>
              </View>

              <Text style={styles.versionSectionTitle}>Features</Text>

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🎾</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Match Tracking</Text>
                  <Text style={styles.featureDescription}>Log matches with opponent name, score, court type, and date</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📊</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Statistics Dashboard</Text>
                  <Text style={styles.featureDescription}>View win/loss record, win rate, streaks, and monthly performance</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>👥</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Opponent Analysis</Text>
                  <Text style={styles.featureDescription}>Track your record against each opponent</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🏆</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Match Formats</Text>
                  <Text style={styles.featureDescription}>Support for one set, two sets, and three sets with super tiebreak</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🔔</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Daily Reminders</Text>
                  <Text style={styles.featureDescription}>Set a daily reminder to log your matches</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🎸</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>String Reminder</Text>
                  <Text style={styles.featureDescription}>Get notified after 4 matches to check your string tension</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>👤</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Player Profile</Text>
                  <Text style={styles.featureDescription}>Store your name, age, main hand, and racket info</Text>
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
        <Text style={styles.headerTitle}>🎾 Tennis Tracker</Text>
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
            Stats
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, currentScreen === 'history' && styles.activeTab]}
          onPress={() => setCurrentScreen('history')}
        >
          <Text style={[styles.tabText, currentScreen === 'history' && styles.activeTabText]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {currentScreen === 'home' && (
          <View>
            {/* Overall Stats */}
            <View style={styles.statsCard}>
              <Text style={styles.cardTitle}>Overall Performance in 2026</Text>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{stats.wins}</Text>
                  <Text style={styles.statLabel}>Wins</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{stats.losses}</Text>
                  <Text style={styles.statLabel}>Losses</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{stats.winRate}%</Text>
                  <Text style={styles.statLabel}>Win Rate</Text>
                </View>
              </View>
            </View>

            {/* Monthly Stats */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>This Month</Text>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{stats.monthlyWins}</Text>
                  <Text style={styles.statLabel}>Wins</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{stats.monthlyLosses}</Text>
                  <Text style={styles.statLabel}>Losses</Text>
                </View>
              </View>
            </View>

            {/* Current Streak */}
            {stats.currentStreak > 0 && (
              <View style={styles.streakCard}>
                <Text style={styles.streakEmoji}>🔥</Text>
                <Text style={styles.streakText}>
                  {stats.currentStreak} Win Streak!
                </Text>
              </View>
            )}

            {/* Last 5 Matches */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Last 5 Matches</Text>
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
              <Text style={styles.cardTitle}>Most Beaten Opponents</Text>
              {stats.mostBeaten.map(([opponent, record]) => (
                <View key={opponent} style={styles.opponentItem}>
                  <Text style={styles.opponentName}>{opponent}</Text>
                  <Text style={styles.opponentRecord}>{record.wins}W - {record.losses}L</Text>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Toughest Opponents</Text>
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
            <Text style={styles.sectionTitle}>Match History</Text>
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
                  <Text style={styles.historyCourt}>{match.courtType}</Text>
                  <View style={[
                    styles.resultBadge,
                    match.result === 'win' ? styles.winBadge : styles.lossBadge
                  ]}>
                    <Text style={styles.resultText}>
                      {match.result === 'win' ? 'WIN' : 'LOSS'}
                    </Text>
                  </View>
                </View>
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
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>

              {/* Date Picker View */}
              {showDatePicker ? (
                <>
                  <Text style={styles.modalTitle}>Select Date</Text>

                  {/* Day Selector */}
                  <View style={styles.dateRow}>
                    <Text style={styles.dateLabel}>Day</Text>
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
                    <Text style={styles.dateLabel}>Month</Text>
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
                    <Text style={styles.dateLabel}>Year</Text>
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
                      <Text style={styles.quickDateText}>Today</Text>
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
                      <Text style={styles.quickDateText}>Yesterday</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[styles.button, styles.addButton, { marginTop: 20 }]}
                    onPress={applyDate}
                  >
                    <Text style={styles.addButtonText}>Done</Text>
                  </TouchableOpacity>
                </>
              ) : (
              <>
              <Text style={styles.modalTitle}>Add Match</Text>

              <TextInput
                style={styles.input}
                placeholder="Opponent Name"
                value={opponentName}
                onChangeText={setOpponentName}
                returnKeyType="done"
                blurOnSubmit={true}
              />

              <Text style={styles.label}>Match Format</Text>
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
                    One Set
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
                    Two Sets
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
                    Three Sets
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Set 1 Score</Text>
              <View style={styles.scoreRow}>
                <View style={styles.scoreInputContainer}>
                  <TextInput
                    style={[styles.input, styles.scoreInput, scoreErrors.set1My && styles.inputError]}
                    placeholder="My"
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
                    placeholder="Opp"
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
                  <Text style={styles.label}>Set 2 Score</Text>
                  <View style={styles.scoreRow}>
                    <View style={styles.scoreInputContainer}>
                      <TextInput
                        ref={set2MyRef}
                        style={[styles.input, styles.scoreInput, scoreErrors.set2My && styles.inputError]}
                        placeholder="My"
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
                        placeholder="Opp"
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
                  <Text style={styles.label}>Set 3 - Super Tiebreak</Text>
                  <View style={styles.scoreRow}>
                    <View style={styles.scoreInputContainer}>
                      <TextInput
                        ref={set3MyRef}
                        style={[styles.input, styles.scoreInput, scoreErrors.set3My && styles.inputError]}
                        placeholder="My"
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
                        placeholder="Opp"
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

              <Text style={styles.label}>Court Type</Text>
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
                    Clay
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
                    Hard
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Match Date</Text>
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

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setShowAddMatch(false);
                    setScoreErrors({});
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.addButton]}
                  onPress={addMatch}
                >
                  <Text style={styles.addButtonText}>Add Match</Text>
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
            <Text style={styles.stringNotificationTitle}>Time for New Strings?</Text>
            <Text style={styles.stringNotificationText}>
              You've played 4 matches! Your strings may have lost tension and could affect your game. Consider getting them replaced for optimal performance.
            </Text>
            <TouchableOpacity
              style={styles.stringNotificationButton}
              onPress={() => setShowStringNotification(false)}
            >
              <Text style={styles.stringNotificationButtonText}>Got it!</Text>
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
