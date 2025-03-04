// components/LeaderboardItem.js
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

const LeaderboardItem = ({ rank, user, points, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.container}>
    <View style={styles.rankContainer}>
      <Text style={styles.rank}>{rank}</Text>
      <Text style={styles.name}>{user.name}</Text>
    </View>
    <Text style={styles.points}>{points} pts</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rank: {
    width: 30,
    textAlign: 'center',
    fontWeight: '600',
    color: '#7f8c8d',
  },
  name: {
    fontSize: 16,
    paddingLeft: 10,
    fontWeight: '500',
    color: '#2c3e50',
  },
  points: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
});

export default LeaderboardItem;
