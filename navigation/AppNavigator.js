import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from './BottomTabs';
import PicksScreen from '../screens/Picks';
import UserStats from '../components/UserStats';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      {/* Ensure BottomTabs is within Stack Navigator */}
      <Stack.Screen name="MainTabs" component={BottomTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Picks" component={PicksScreen} />
      <Stack.Screen name="UserStats" component={UserStats} options={{ title: 'User Stats' }} />
    </Stack.Navigator>
  );
}
