import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './context/AuthContext';
import { PicksProvider } from './context/PicksContext';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <PicksProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </PicksProvider>
    </AuthProvider>
  );
}