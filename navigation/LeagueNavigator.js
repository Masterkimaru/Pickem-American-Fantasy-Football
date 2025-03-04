import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LeaguesScreen from '../screens/Leagues';
import CreateLeagueScreen from '../screens/Leagues/CreateLeague';
import LeagueDetailScreen from '../screens/Leagues/Detail';
import MatchupsScreen from '../components/Matchups';
import PendingMembersScreen from '../components/PendingMembers';


const Stack = createNativeStackNavigator();

export default function LeagueNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="LeaguesList" component={LeaguesScreen} options={{ title: 'My Leagues' }} />
      <Stack.Screen name="CreateLeague" component={CreateLeagueScreen} />
      <Stack.Screen name="LeagueDetail" component={LeagueDetailScreen} />
      <Stack.Screen name="Matchups" component={MatchupsScreen} options={{ title: 'League Matchups' }} />
      <Stack.Screen name="PendingMembers" component={PendingMembersScreen} options={{ title: 'Pending Members' }} />
    </Stack.Navigator>
  );
}