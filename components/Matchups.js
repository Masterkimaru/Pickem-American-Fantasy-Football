import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  Animated, 
  TouchableOpacity, 
  TextInput,
  Alert,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import the icon library
import { useAuth } from '../context/AuthContext';
import { fetchMatchups, createTournamentBracket, deleteTournament } from '../services/api';

// A separate component for each matchup item with animation.
function MatchupItem({ item, index }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      delay: index * 100, // staggered animation for each item
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, index]);

  return (
    <Animated.View style={[styles.matchupItem, { opacity: fadeAnim }]}>
      <Text style={styles.matchupInfo}>
        Round {item.round} | Week {item.week}
      </Text>
      <Text style={styles.matchupTitle}>
        {item.user1?.name || 'Team 1'} vs {item.user2?.name || 'Team 2'}
      </Text>
      <Text style={styles.matchupSubtitle}>
        Winner:{' '}
        {item.winnerId
          ? item.winnerId === item.user1Id
            ? item.user1?.name || 'Team 1'
            : item.user2?.name || 'Team 2'
          : 'TBD'}
      </Text>
    </Animated.View>
  );
}

export default function MatchupsScreen({ route }) {
  const { leagueId } = route.params;
  const { user } = useAuth();
  const [matchups, setMatchups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tournamentActive, setTournamentActive] = useState(false);
  const [tournamentId, setTournamentId] = useState('');
  const [startingWeek, setStartingWeek] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false); // State to control menu visibility

  const spinValue = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue]);
  const loadingSpin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    const loadMatchups = async () => {
      try {
        const data = await fetchMatchups(leagueId, user.token);
        setMatchups(data);
        const active = data.some(matchup => !matchup.winnerId);
        setTournamentActive(active);
      } catch (error) {
        console.error('Error loading matchups:', error);
      } finally {
        setLoading(false);
      }
    };
    loadMatchups();
  }, [leagueId, user.token]);

  const handleCreateTournament = async () => {
    setCreateLoading(true);
    try {
      const startingWeekNum = parseInt(startingWeek, 10);
      if (startingWeekNum < 14) {
        Alert.alert("Error", "Cannot create match-up until week 14");
        setCreateLoading(false);
        return;
      }
      
      const tournamentData = {
        leagueId,
        startingWeek: startingWeekNum,
        tournamentId,
      };
  
      const response = await createTournamentBracket(tournamentData, user.token);
      const { tournamentId: createdTournamentId, matchups: newMatchups } = response;
  
      setTournamentId(createdTournamentId || tournamentData.tournamentId);
  
      if (newMatchups && newMatchups.length) {
        setMatchups(newMatchups);
      } else {
        const updatedMatchups = await fetchMatchups(leagueId, user.token);
        setMatchups(updatedMatchups);
      }
      setTournamentActive(true);
    } catch (error) {
      console.error('Error creating tournament:', error);
    }
    setCreateLoading(false);
  };
  

  const handleDeleteTournament = () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete the tournament matchups for this league?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Deletion cancelled"),
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: async () => {
            setDeleteLoading(true);
            try {
              await deleteTournament(leagueId, user.token);
              setTournamentActive(false);
              setMatchups([]);
              console.log("Tournament matchups deleted successfully.");
            } catch (error) {
              console.error("Error deleting tournament:", error);
            }
            setDeleteLoading(false);
          },
          style: "destructive"
        }
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading matchups...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
          <Ionicons name="menu" size={30} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Matchups</Text>
      </View>

      {menuVisible && (
        <View>
          {/* Input field for Tournament ID (used for creation) */}
          <Text style={styles.inputLabel}>Tournament ID:</Text>
          <TextInput
            style={styles.textInput}
            value={tournamentId}
            onChangeText={setTournamentId}
            placeholder="Enter Tournament ID"
          />

          {/* Input field for Starting Week */}
          <Text style={styles.inputLabel}>Starting Week:</Text>
          <TextInput
            style={styles.textInput}
            value={startingWeek}
            onChangeText={setStartingWeek}
            placeholder="Enter Starting Week"
            keyboardType="numeric"
          />

          {/* Create Tournament Button */}
          <TouchableOpacity
            style={[styles.button, tournamentActive && styles.buttonDisabled]}
            onPress={handleCreateTournament}
            disabled={tournamentActive || createLoading}
          >
            {createLoading ? (
              <Animated.Image
                source={require('../assets/football.png')}
                style={[styles.loadingIcon, { transform: [{ rotate: loadingSpin }] }]}
              />
            ) : (
              <Text style={styles.buttonText}>
                {tournamentActive ? 'Tournament Ongoing' : 'Create Tournament'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Delete Tournament Button (shown when a tournament is active) */}
          {tournamentActive && (
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteTournament} disabled={deleteLoading}>
              {deleteLoading ? (
                <Animated.Image
                  source={require('../assets/football.png')}
                  style={[styles.loadingIcon, { transform: [{ rotate: loadingSpin }] }]}
                />
              ) : (
                <Text style={styles.deleteButtonText}>Delete Tournament</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      {matchups.length === 0 ? (
        <Text style={styles.noMatchupsText}>No Matchups created</Text>
      ) : (
        <FlatList
          data={matchups}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => <MatchupItem item={item} index={index} />}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
  },
  noMatchupsText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#777',
    marginTop: 20,
  },
  matchupItem: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  matchupInfo: {
    fontSize: 14,
    fontWeight: '400',
    color: '#777',
    marginBottom: 4,
  },
  matchupTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  matchupSubtitle: {
    fontSize: 16,
    color: '#555',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#D32F2F',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  textInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 8,
    marginBottom: 16,
    borderRadius: 4,
  },
  loadingIcon: {
    width: 30,
    height: 30,
  },
});