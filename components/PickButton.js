import { TouchableOpacity, Text } from 'react-native';
import * as Animatable from 'react-native-animatable';

export default function PickButton({ team, onPress, isSelected }) {
  return (
    <Animatable.View 
      animation="bounceIn"
      duration={1000}
      useNativeDriver={true}
    >
      <TouchableOpacity
        style={{
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 8,
          backgroundColor: isSelected ? '#4CAF50' : '#E0E0E0', // Highlight selected team
          elevation: 4,
          transform: [{ scale: isSelected ? 1.1 : 1 }],
        }}
        onPress={onPress}
      >
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: isSelected ? '#fff' : '#333',
        }}>
          {team.abbreviation}
        </Text>
      </TouchableOpacity>
    </Animatable.View>
  );
}
