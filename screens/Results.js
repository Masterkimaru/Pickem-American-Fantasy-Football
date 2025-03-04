import { View, Text, FlatList } from 'react-native';
import { usePicks } from '../context/PicksContext';
import { formatGameDate } from '../utils/formatDate';
import { Ionicons } from '@expo/vector-icons';

export default function Results() {
  const { pastPicks, games } = usePicks();

  const groupedPicks = pastPicks.reduce((acc, pick) => {
    if (!acc[pick.week]) acc[pick.week] = [];
    acc[pick.week].push(pick);
    return acc;
  }, {});

  return (
    <View className="p-4 flex-1 bg-gray-50">
      <Text className="text-2xl font-bold mb-4">Past Results</Text>
      
      {Object.keys(groupedPicks).map(week => (
        <View key={week} className="mb-6">
          <Text className="text-lg font-bold mb-2">Week {week}</Text>
          {groupedPicks[week].map((pick) => {
            const game = games.find(g => g.id === pick.gameId);
            return (
              <View key={pick.gameId} className="bg-white p-4 rounded-lg mb-2">
                <Text className="text-gray-600 text-sm">
                  {formatGameDate(game.startTime)}
                </Text>
                <View className="flex-row justify-between items-center mt-2">
                  <Text className="font-bold">
                    {game.homeTeam.abbreviation} vs {game.awayTeam.abbreviation}
                  </Text>
                  <Ionicons
                    name={pick.isCorrect ? 'checkmark-circle' : 'close-circle'}
                    size={24}
                    color={pick.isCorrect ? '#10B981' : '#EF4444'}
                  />
                </View>
                <Text className="text-sm mt-1">
                  Your pick: {pick.selectedTeam} • Result: {game.result.winner}
                </Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}