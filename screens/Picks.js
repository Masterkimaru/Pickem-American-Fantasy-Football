import React, { useState, useEffect, useRef } from 'react';
import { 
  ScrollView, 
  Text, 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { usePicks } from '../context/PicksContext';
import { useAuth } from '../context/AuthContext';
import GameCard from '../components/Gamecard';
import PickButton from '../components/PickButton';
import { submitPicks, updatePicks } from '../services/api';

const PicksScreen = () => {
  // Destructure updateSelectedPicks from the context
  const { 
    currentWeekGames, 
    selectedPicks, 
    makePick, 
    currentWeek,
    updateSelectedPicks 
  } = usePicks();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  
  // Check if at least one pick is made
  const hasMadePicks = Object.keys(selectedPicks).length > 0;

  // Monitor selectedPicks: if all picks have a pickId, consider them confirmed.
  useEffect(() => {
    const picksArray = Object.values(selectedPicks);
    if (picksArray.length > 0 && picksArray.every(pick => pick.pickId)) {
      setIsConfirmed(true);
    } else {
      setIsConfirmed(false);
    }
  }, [selectedPicks]);

  // Create an Animated.Value for the spinning effect
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

  // Interpolate the spin value to degrees
  const loadingSpin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Handler for confirming picks: shows a confirmation alert
  const confirmPicksHandler = () => {
    if (!hasMadePicks) return;

    Alert.alert(
      'Confirm Picks',
      'Are you sure you want to lock in your picks for this week?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Submit Picks',
          onPress: () => {
            setIsSubmitting(true);
            // Prepare picks array from the selectedPicks state.
            const picksArray = Object.keys(selectedPicks).map(gameId => ({
              gameId,
              selectedTeam: selectedPicks[gameId].team,
            }));

            // Call the API function to submit the picks.
            submitPicks(user.userId, picksArray)
              .then((data) => {
                console.log('Picks submitted successfully:', data);
                // Update selectedPicks with the returned pick IDs
                const updatedPicks = { ...selectedPicks };
                data.createdPicks.forEach((pick) => {
                  updatedPicks[pick.gameId] = {
                    ...updatedPicks[pick.gameId],
                    pickId: pick.id, // Assign the pick id from the backend
                  };
                });
                // Update the picks state using the context updater function.
                updateSelectedPicks(updatedPicks);
                setIsSubmitting(false);
                setIsConfirmed(true);
              })
              .catch((error) => {
                console.error('Error submitting picks:', error);
                setIsSubmitting(false);
                Alert.alert('Submission Error', 'There was an error submitting your picks. Please try again.');
              });
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Handler for updating picks
  const updatePicksHandler = () => {
    if (!hasMadePicks) return;

    setIsUpdating(true); // Start the loading indicator for updating

    // Build the array from selectedPicks.
    // If a pickId exists, include it; otherwise include gameId.
    const picksArray = Object.keys(selectedPicks).map(gameId => {
      const pick = selectedPicks[gameId];
      return {
        selectedTeam: pick.team,
        ...(pick.pickId ? { pickId: pick.pickId } : { gameId }),
      };
    });

    if (picksArray.length === 0) {
      console.error('No valid picks to update.');
      setIsUpdating(false);
      return;
    }

    updatePicks(user.userId, picksArray)
      .then((data) => {
        console.log('Picks updated successfully:', data);
        // Optionally update local state if the response returns updated picks.
        if (data.updatedPicks) {
          const newSelectedPicks = { ...selectedPicks };
          data.updatedPicks.forEach((pick) => {
            newSelectedPicks[pick.gameId] = {
              ...newSelectedPicks[pick.gameId],
              team: pick.selectedTeam,
            };
          });
          updateSelectedPicks(newSelectedPicks);
        }
        setIsConfirmed(true);
      })
      .catch((error) => {
        console.error('Error updating picks:', error);
        Alert.alert('Update Error', 'There was an error updating your picks. Please try again.');
      })
      .finally(() => {
        setIsUpdating(false); // Stop the loading indicator
      });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* Confirm Picks Button at the Top */}
      <TouchableOpacity
        style={[
          styles.confirmButton,
          (!hasMadePicks || isSubmitting || isConfirmed) && styles.disabledButton,
        ]}
        onPress={confirmPicksHandler}
        disabled={!hasMadePicks || isSubmitting || isConfirmed}
      >
        {isSubmitting ? (
          <Animated.Image
            source={require('../assets/football.png')}
            style={[styles.loadingIcon, { transform: [{ rotate: loadingSpin }] }]}
          />
        ) : (
          <Text style={styles.confirmButtonText}>
            {isConfirmed ? 'Picks Confirmed' : 'Confirm Picks'}
          </Text>
        )}
      </TouchableOpacity>

      {/* Update Picks Button */}
      <TouchableOpacity
        style={[
          styles.updateButton,
          (!hasMadePicks || isSubmitting || isUpdating || isConfirmed) && styles.disabledButton,
        ]}
        onPress={updatePicksHandler}
        disabled={!hasMadePicks || isSubmitting || isUpdating || isConfirmed}
      >
        {isUpdating ? (
          <Animated.Image
            source={require('../assets/football.png')}
            style={[styles.loadingIcon, { transform: [{ rotate: loadingSpin }] }]}
          />
        ) : (
          <Text style={styles.updateButtonText}>Update Picks</Text>
        )}
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Week {currentWeek} Picks</Text>
        {currentWeekGames.map((game) => (
          <View key={game.id} style={styles.gameContainer}>
            <GameCard {...game} />
            <View style={styles.buttonContainer}>
              <PickButton
                team={game.homeTeam}
                onPress={() => {
                  makePick(game.id, 'home');
                  setIsConfirmed(false); // Reset confirmation if user changes a pick
                }}
                isSelected={selectedPicks[game.id]?.team === 'home'}
              />
              <PickButton
                team={game.awayTeam}
                onPress={() => {
                  makePick(game.id, 'away');
                  setIsConfirmed(false); // Reset confirmation if user changes a pick
                }}
                isSelected={selectedPicks[game.id]?.team === 'away'}
              />
            </View>
          </View>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  updateButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 12,
    alignItems: 'center',
    marginVertical: 8,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  gameContainer: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    padding: 16,
    width: '100%',
    alignSelf: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  loadingIcon: {
    width: 24,
    height: 24,
  },
});

export default PicksScreen;
