// components/UserStats.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { ProgressChart } from 'react-native-chart-kit';
import { fetchUserByName } from '../services/api';
import { useAuth } from '../context/AuthContext'; // Adjust the path as needed

const screenWidth = Dimensions.get('window').width;

const UserStats = ({ route }) => {
  // Retrieve userName from the navigation route parameters
  const { userName } = route.params;
  const { user } = useAuth(); // Retrieve the logged in user from context
  const token = user ? user.token : null;

  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  if (!token) {
    return (
      <View style={styles.centered}>
        <Text>Please log in to see user stats.</Text>
      </View>
    );
  }

  useEffect(() => {
    async function getUserStats() {
      try {
        const data = await fetchUserByName(userName, token);
        setUserStats(data.user);
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setLoading(false);
      }
    }
    getUserStats();
  }, [userName, token]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!userStats) {
    return (
      <View style={styles.centered}>
        <Text>User not found.</Text>
      </View>
    );
  }

  // Prepare data for the progress chart (winPct is assumed to be between 0 and 100)
  const progressData = {
    data: [userStats.winPct / 100],
  };

  return (
    <View style={styles.container}>
      {/* Header with Person Icon and Name */}
      <View style={styles.header}>
        <FontAwesome name="user" size={30} color="#333" style={styles.icon} />
        <Text style={styles.userName}>{userStats.name}</Text>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Wins</Text>
          <Text style={styles.statValue}>{userStats.wins}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Losses</Text>
          <Text style={styles.statValue}>{userStats.losses}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Draws</Text>
          <Text style={styles.statValue}>{userStats.draws}</Text>
        </View>
      </View>

      {/* Win Percentage Graph */}
      <View style={styles.graphContainer}>
        <Text style={styles.graphLabel}>Win Percentage</Text>
        <ProgressChart
          data={progressData}
          width={screenWidth * 0.8}
          height={150}
          strokeWidth={16}
          radius={32}
          chartConfig={{
            backgroundColor: '#e26a00',
            backgroundGradientFrom: '#fb8c00',
            backgroundGradientTo: '#ffa726',
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          hideLegend={false}
          style={styles.chart}
        />
        <Text style={styles.winPctText}>{userStats.winPct}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    marginRight: 10,
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  graphContainer: {
    alignItems: 'center',
  },
  graphLabel: {
    fontSize: 20,
    marginBottom: 10,
    color: '#333',
  },
  winPctText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default UserStats;
