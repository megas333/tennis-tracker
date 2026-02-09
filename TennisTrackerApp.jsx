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
} from 'react-native';

const TennisTrackerApp = () => {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [user, setUser] = useState(null);
  const [matches, setMatches] = useState([]);

  // Login/Register State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  // Loading Animation State
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Logging into your Tennis Universe');
  const progressAnim = useRef(new Animated.Value(0)).current;

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

  // Get max score based on match format and set number
  const getMaxScore = (format, setNumber) => {
    if (format === 'one-set') return 9;
    if (format === 'two-sets') return 6;
    if (format === 'three-sets') {
      return setNumber === 3 ? 10 : 6;
    }
    return 6;
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

  // Handle login with animation
  const handleAuth = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    Keyboard.dismiss();
    setIsLoggingIn(true);
    setLoadingProgress(0);
    setLoadingText('Logging into your Tennis Universe');

    // Animate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setLoadingProgress(100);
        setLoadingText('Success!');

        setTimeout(() => {
          setUser({ email, uid: 'mock-uid' });
          setCurrentScreen('home');
          setIsLoggingIn(false);
          loadMatches();
        }, 800);
      } else {
        setLoadingProgress(Math.floor(progress));
      }
    }, 200);
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

    Alert.alert('Success', `Match added - ${result === 'win' ? 'Victory! 🎉' : 'Better luck next time!'}`);
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

  // Generate calendar days for date picker
  const generateCalendarDays = () => {
    const year = matchDate.getFullYear();
    const month = matchDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];

    // Add empty slots for days before the first day
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: '', empty: true });
    }

    // Add the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, empty: false });
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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
            returnKeyType="next"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleAuth}
          />

          <TouchableOpacity style={styles.primaryButton} onPress={handleAuth}>
            <Text style={styles.primaryButtonText}>
              {isRegister ? 'Register' : 'Login'} →
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
            <Text style={styles.linkText}>
              {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const stats = calculateStats();

  // Main App
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎾 Tennis Tracker</Text>
        <TouchableOpacity onPress={() => setUser(null)}>
          <Text style={styles.logoutText}>Logout</Text>
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

              <Text style={styles.label}>Set 1 Score (max {getMaxScore(matchFormat, 1)})</Text>
              <View style={styles.scoreRow}>
                <View style={styles.scoreInputContainer}>
                  <TextInput
                    style={[styles.input, styles.scoreInput, scoreErrors.set1My && styles.inputError]}
                    placeholder="My"
                    value={set1MyScore}
                    onChangeText={(text) => setSet1MyScore(validateScore(text, matchFormat, 1, 'set1My'))}
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
                    style={[styles.input, styles.scoreInput, scoreErrors.set1Opp && styles.inputError]}
                    placeholder="Opp"
                    value={set1OppScore}
                    onChangeText={(text) => setSet1OppScore(validateScore(text, matchFormat, 1, 'set1Opp'))}
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
                  <Text style={styles.label}>Set 2 Score (max {getMaxScore(matchFormat, 2)})</Text>
                  <View style={styles.scoreRow}>
                    <View style={styles.scoreInputContainer}>
                      <TextInput
                        style={[styles.input, styles.scoreInput, scoreErrors.set2My && styles.inputError]}
                        placeholder="My"
                        value={set2MyScore}
                        onChangeText={(text) => setSet2MyScore(validateScore(text, matchFormat, 2, 'set2My'))}
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
                        style={[styles.input, styles.scoreInput, scoreErrors.set2Opp && styles.inputError]}
                        placeholder="Opp"
                        value={set2OppScore}
                        onChangeText={(text) => setSet2OppScore(validateScore(text, matchFormat, 2, 'set2Opp'))}
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
                  <Text style={styles.label}>Set 3 - Super Tiebreak (max {getMaxScore(matchFormat, 3)})</Text>
                  <View style={styles.scoreRow}>
                    <View style={styles.scoreInputContainer}>
                      <TextInput
                        style={[styles.input, styles.scoreInput, scoreErrors.set3My && styles.inputError]}
                        placeholder="My"
                        value={set3MyScore}
                        onChangeText={(text) => setSet3MyScore(validateScore(text, matchFormat, 3, 'set3My'))}
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
              <View style={styles.buttonGroup}>
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
                onPress={() => setShowDatePicker(true)}
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
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Custom Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.datePickerModal}>
            <Text style={styles.modalTitle}>Select Date</Text>

            {/* Month/Year Navigation */}
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                style={styles.calendarNavButton}
                onPress={() => {
                  const newDate = new Date(matchDate);
                  newDate.setMonth(newDate.getMonth() - 1);
                  setMatchDate(newDate);
                }}
              >
                <Text style={styles.calendarNavText}>◀</Text>
              </TouchableOpacity>

              <Text style={styles.calendarMonthYear}>
                {monthNames[matchDate.getMonth()]} {matchDate.getFullYear()}
              </Text>

              <TouchableOpacity
                style={styles.calendarNavButton}
                onPress={() => {
                  const newDate = new Date(matchDate);
                  newDate.setMonth(newDate.getMonth() + 1);
                  setMatchDate(newDate);
                }}
              >
                <Text style={styles.calendarNavText}>▶</Text>
              </TouchableOpacity>
            </View>

            {/* Day Labels */}
            <View style={styles.calendarDayLabels}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <Text key={day} style={styles.calendarDayLabel}>{day}</Text>
              ))}
            </View>

            {/* Calendar Days */}
            <View style={styles.calendarGrid}>
              {generateCalendarDays().map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.calendarDay,
                    item.empty && styles.calendarDayEmpty,
                    item.day === matchDate.getDate() && !item.empty && styles.calendarDaySelected
                  ]}
                  onPress={() => {
                    if (!item.empty) {
                      const newDate = new Date(matchDate);
                      newDate.setDate(item.day);
                      setMatchDate(newDate);
                    }
                  }}
                  disabled={item.empty}
                >
                  <Text style={[
                    styles.calendarDayText,
                    item.day === matchDate.getDate() && !item.empty && styles.calendarDayTextSelected
                  ]}>
                    {item.day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Quick Date Buttons */}
            <View style={styles.quickDateButtons}>
              <TouchableOpacity
                style={styles.quickDateButton}
                onPress={() => setMatchDate(new Date())}
              >
                <Text style={styles.quickDateText}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickDateButton}
                onPress={() => {
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  setMatchDate(yesterday);
                }}
              >
                <Text style={styles.quickDateText}>Yesterday</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, styles.addButton, { marginTop: 15 }]}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.addButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  logoutText: {
    color: '#d32f2f',
    fontSize: 14,
  },
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginTop: 10,
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
  // Court Type Buttons with green outline when selected
  courtButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: 'transparent',
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
    fontSize: 14,
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
  // Custom Calendar Styles
  datePickerModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarNavButton: {
    padding: 10,
  },
  calendarNavText: {
    fontSize: 18,
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  calendarMonthYear: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  calendarDayLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  calendarDayLabel: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  calendarDayEmpty: {
    backgroundColor: 'transparent',
  },
  calendarDaySelected: {
    backgroundColor: '#2e7d32',
    borderRadius: 20,
  },
  calendarDayText: {
    fontSize: 16,
    color: '#333',
  },
  calendarDayTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
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
});

export default TennisTrackerApp;
