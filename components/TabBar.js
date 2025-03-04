import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function TabBar({ state, descriptors }) {
  const navigation = useNavigation();

  return (
    <View className="flex-row bg-white border-t border-gray-200 py-2">
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const { options } = descriptors[route.key];

        const iconMap = {
          Home: 'home-outline',
          Leaderboard: 'podium-outline',
          Profile: 'person-outline',
          Leagues: 'people-outline',
          
        };

        return (
          <TouchableOpacity
            key={route.key}
            className="flex-1 items-center"
            onPress={() => navigation.navigate(route.name)}
          >
            <Ionicons
              name={isFocused ? iconMap[route.name].replace('-outline', '') : iconMap[route.name]}
              size={24}
              color={isFocused ? '#3B82F6' : '#64748B'}
            />
            <Text className={`text-xs ${isFocused ? 'text-blue-500' : 'text-gray-500'}`}>
              {options.title || route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}