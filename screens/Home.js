import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchGames, fetchCurrentWeekLockTime } from '../services/api';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

// Create an animated version of TouchableOpacity
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const GameCard = ({ homeTeam, awayTeam, spread, status, index }) => (
  <Animated.View
    entering={FadeInDown.delay(index * 100).duration(700)}
    style={styles.card}
  >
    <View style={styles.teamsContainer}>
      <TeamDisplay team={homeTeam} />
      <Text style={styles.vsText}>VS</Text>
      <TeamDisplay team={awayTeam} />
    </View>
    <Text style={styles.spreadText}>
      Spread: {formatSpread(spread)} | {status}
    </Text>
  </Animated.View>
);

const TeamDisplay = ({ team }) => (
  <View style={styles.teamContainer}>
    {team.logo && (
      <Image
        source={team.logo}
        style={styles.teamLogo}
        resizeMode="contain"
      />
    )}
    <Text style={styles.teamName}>{team.abbreviation}</Text>
  </View>
);

const formatSpread = (spread) => {
  if (spread === 0) return "Pick'em";
  return spread > 0 ? `+${spread}` : spread.toString();
};

// CountdownTimer component counts down to a target time (lockTime)
const CountdownTimer = ({ targetTime }) => {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(targetTime));

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeRemaining(targetTime);
      setTimeLeft(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  if (!targetTime || timeLeft.total <= 0) {
    return <Text style={styles.countdownText}>Picks Locked!</Text>;
  }

  return (
    <Text style={styles.countdownText}>
      {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
    </Text>
  );
};

const getTimeRemaining = (target) => {
  if (!target) return { total: 0 };
  const total = Date.parse(target) - Date.parse(new Date());
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return { total, days, hours, minutes, seconds };
};

// Animated "Make Picks" button using AnimatedTouchable with a 3D scaling effect
const MakePicksButton = () => {
  const navigation = useNavigation();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.95, { damping: 5, stiffness: 150 });
  };

  const onPressOut = () => {
    scale.value = withSpring(1, { damping: 5, stiffness: 150 });
    navigation.navigate('Picks');
  };

  return (
    <AnimatedTouchable
      style={[styles.button, animatedStyle]}
      activeOpacity={0.8}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Text style={styles.buttonText}>Make Picks</Text>
    </AnimatedTouchable>
  );
};

const Home = () => {
  const [games, setGames] = useState([]);
  const [currentLockTime, setCurrentLockTime] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch games for week 
        const gamesData = await fetchGames();
        const transformedGames = gamesData.games.map((game) => ({
          ...game,
          homeTeam: {
            name: game.homeTeam,
            abbreviation: game.homeTeam,
            logo: { uri: game.homeTeamLogo },
          },
          awayTeam: {
            name: game.awayTeam,
            abbreviation: game.awayTeam,
            logo: { uri: game.awayTeamLogo },
          },
          spread: game.pointSpread,
        }));
        setGames(transformedGames);

        // Fetch current week's lock time from backend
        const lockTimeData = await fetchCurrentWeekLockTime();
        setCurrentLockTime(lockTimeData.lockTime);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Upcoming Games</Text>
        
        {/* Countdown Timer for the picks deadline */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>Time until picks lock:</Text>
          {currentLockTime ? (
            <CountdownTimer targetTime={currentLockTime} />
          ) : (
            <Text style={styles.countdownText}>Loading...</Text>
          )}
        </View>
        
        {/* Animated "Make Picks" button */}
        <MakePicksButton />

        {/* FlatList displaying the games */}
        <FlatList
          data={games}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <GameCard
              homeTeam={item.homeTeam}
              awayTeam={item.awayTeam}
              spread={item.spread}
              status={item.status}
              index={index}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No upcoming games available.</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerLabel: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 4,
  },
  countdownText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  teamLogo: {
    width: 64,
    height: 64,
    marginBottom: 8,
  },
  teamName: {
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
  },
  vsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4b5563',
  },
  spreadText: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    shadowColor: '#4338ca',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    alignSelf: 'center',
    marginVertical: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Home;
