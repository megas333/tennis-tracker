import React, { useState, useEffect } from 'react';
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
} from 'react-native';

// Firebase configuration (you'll need to add your Firebase config)
// import { initializeApp } from 'firebase/app';
// import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
// import { getFirestore, collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';

const TennisTrackerApp = () => {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [user, setUser] = useState(null);
  const [matches, setMatches] = useState([]);

  // Login/Register State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  // Add Match State
  const [showAddMatch, setShowAddMatch] = useState(false);
  const [opponentName, setOpponentName] = useState('');
  const [myScore, setMyScore] = useState('');
  const [opponentScore, setOpponentScore] = useState('');
  const [courtType, setCourtType] = useState('hard');
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [result, setResult] = useState('win');

  // Mock authentication (replace with Firebase)
  const handleAuth = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    // Mock login - replace with Firebase auth
    setUser({ email, uid: 'mock-uid' });
    setCurrentScreen('home');
    loadMatches();
  };

  // Mock data loading (replace with Firebase)
  const loadMatches = () => {
    // This would fetch from Firebase Firestore
    const mockMatches = [
      { id: '1', opponent: 'John Smith', myScore: '6', opponentScore: '4', date: '2026-02-01', courtType: 'hard', result: 'win' },
      { id: '2', opponent: 'Mike Johnson', myScore: '4', opponentScore: '6', date: '2026-02-02', courtType: 'clay', result: 'loss' },
      { id: '3', opponent: 'John Smith', myScore: '6', opponentScore: '3', date: '2026-02-03', courtType: 'hard', result: 'win' },
      { id: '4', opponent: 'Sarah Williams', myScore: '7', opponentScore: '5', date: '2026-02-04', courtType: 'clay', result: 'win' },
      { id: '5', opponent: 'Mike Johnson', myScore: '6', opponentScore: '7', date: '2026-02-05', courtType: 'hard', result: 'loss' },
    ];
    setMatches(mockMatches);
  };

  const addMatch = () => {
    if (!opponentName || !myScore || !opponentScore) {
      Alert.alert('Error', 'Please fill in all match details');
      return;
    }

    const newMatch = {
      id: Date.now().toString(),
      opponent: opponentName,
      myScore,
      opponentScore,
      date: matchDate,
      courtType,
      result,
    };

    // Add to Firebase Firestore
    setMatches([newMatch, ...matches]);

    // Reset form
    setOpponentName('');
    setMyScore('');
    setOpponentScore('');
    setCourtType('hard');
    setMatchDate(new Date().toISOString().split('T')[0]);
    setResult('win');
    setShowAddMatch(false);

    Alert.alert('Success', 'Match added successfully!');
  };

  // Calculate statistics
  const calculateStats = () => {
    const totalMatches = matches.length;
    const wins = matches.filter(m => m.result === 'win').length;
    const losses = totalMatches - wins;
    const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : 0;

    // Last 5 matches
    const last5 = matches.slice(0, 5);

    // Win streak
    let currentStreak = 0;
    for (let match of matches) {
      if (match.result === 'win') currentStreak++;
      else break;
    }

    // Monthly stats (current month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyMatches = matches.filter(m => {
      const matchDate = new Date(m.date);
      return matchDate.getMonth() === currentMonth && matchDate.getFullYear() === currentYear;
    });
    const monthlyWins = monthlyMatches.filter(m => m.result === 'win').length;
    const monthlyLosses = monthlyMatches.length - monthlyWins;

    // Opponent stats
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
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.primaryButton} onPress={handleAuth}>
            <Text style={styles.primaryButtonText}>
              {isRegister ? 'Register' : 'Login'}
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

  // Main App Navigation
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
                    {match.myScore} - {match.opponentScore}
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
                    {match.myScore} - {match.opponentScore}
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
      </ScrollView>

      {/* Floating Add Button */}
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
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Match</Text>

            <TextInput
              style={styles.input}
              placeholder="Opponent Name"
              value={opponentName}
              onChangeText={setOpponentName}
            />

            <View style={styles.scoreRow}>
              <TextInput
                style={[styles.input, styles.scoreInput]}
                placeholder="My Score"
                value={myScore}
                onChangeText={setMyScore}
                keyboardType="number-pad"
                returnKeyType="done"
                blurOnSubmit={true}
              />
              <Text style={styles.scoreDivider}>-</Text>
              <TextInput
                style={[styles.input, styles.scoreInput]}
                placeholder="Opp Score"
                value={opponentScore}
                onChangeText={setOpponentScore}
                keyboardType="number-pad"
                returnKeyType="done"
                blurOnSubmit={true}
              />
            </View>

            <Text style={styles.label}>Court Type</Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  styles.clayButton,
                  courtType === 'clay' && styles.selectedClayButton
                ]}
                onPress={() => setCourtType('clay')}
              >
                <Text style={[
                  styles.optionText,
                  styles.courtTypeText,
                  courtType === 'clay' && styles.selectedClayText
                ]}>
                  Clay
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  styles.hardButton,
                  courtType === 'hard' && styles.selectedHardButton
                ]}
                onPress={() => setCourtType('hard')}
              >
                <Text style={[
                  styles.optionText,
                  styles.courtTypeText,
                  courtType === 'hard' && styles.selectedHardText
                ]}>
                  Hard
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Result</Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  result === 'win' && styles.selectedOption
                ]}
                onPress={() => setResult('win')}
              >
                <Text style={[
                  styles.optionText,
                  result === 'win' && styles.selectedOptionText
                ]}>
                  Win
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  result === 'loss' && styles.selectedOption
                ]}
                onPress={() => setResult('loss')}
              >
                <Text style={[
                  styles.optionText,
                  result === 'loss' && styles.selectedOptionText
                ]}>
                  Loss
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Date (YYYY-MM-DD)"
              value={matchDate}
              onChangeText={setMatchDate}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowAddMatch(false)}
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
  primaryButton: {
    backgroundColor: '#2e7d32',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
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
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    maxHeight: '90%',
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
    alignItems: 'center',
    marginBottom: 15,
  },
  scoreInput: {
    flex: 1,
    marginBottom: 0,
  },
  scoreDivider: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 10,
    color: '#666',
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
  courtTypeText: {
    color: '#fff',
  },
  clayButton: {
    backgroundColor: '#C04000',
    borderColor: '#C04000',
  },
  selectedClayButton: {
    backgroundColor: '#8B2F00',
    borderColor: '#8B2F00',
  },
  selectedClayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  hardButton: {
    backgroundColor: '#0085C7',
    borderColor: '#0085C7',
  },
  selectedHardButton: {
    backgroundColor: '#005A8C',
    borderColor: '#005A8C',
  },
  selectedHardText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default TennisTrackerApp;