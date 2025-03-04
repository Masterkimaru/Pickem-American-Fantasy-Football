import React from 'react';
import { SafeAreaView, View, Text, FlatList, StyleSheet } from 'react-native';
import LeaderboardItem from '../components/LeaderboardItem';
import { usePicks } from '../context/PicksContext';
import { useNavigation } from '@react-navigation/native';

export default function Leaderboard() {
  const { leaderboard } = usePicks();
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Leaderboard 🏆</Text>
      </View>
      <FlatList
        data={leaderboard}
        keyExtractor={(item, index) => item.userId ? item.userId.toString() : index.toString()}
        renderItem={({ item, index }) => (
          <LeaderboardItem
            rank={index + 1}
            user={{ name: item.name || 'Unknown' }}
            points={item.totalPoints || 0}
            onPress={() =>
              navigation.navigate('UserStats', { userName: item.name })
            }
            style={styles.leaderboardItem}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 16,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#4B5563',
    textShadowColor: '#6B7280',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  leaderboardItem: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
  },
});
