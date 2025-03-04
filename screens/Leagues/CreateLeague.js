import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import Animated, { 
  FadeInUp,
  FadeInDown,
  LightSpeedInRight,
  LightSpeedOutLeft,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import { createLeague } from '../../services/api'; // Adjust the path if needed
import { useAuth } from '../../context/AuthContext';

// Create animated versions of TextInput and TouchableOpacity
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const AnimatedButton = Animated.createAnimatedComponent(TouchableOpacity);

export default function CreateLeagueScreen({ navigation }) {
  const [leagueName, setLeagueName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Retrieve the logged-in user from AuthContext
  const { user } = useAuth();

  let [fontsLoaded] = useFonts({
    Pacifico: Pacifico_400Regular,
  });

  // Animated style for error feedback on the league name input
  const errorAnimation = useAnimatedStyle(() => {
    return {
      transform: [
        { 
          translateX: withSpring(showError ? -10 : 0, {
            stiffness: 100,
            damping: 2,
          }),
        },
      ],
    };
  });

  const handleCreate = async () => {
    // Check if the user is logged in
    if (!user) {
      Alert.alert('Error', 'User has to be signed in');
      navigation.navigate('Profile'); // Navigate to the Profile screen for login/registration
      return;
    }

    if (!leagueName.trim()) {
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
      return;
    }
    
    setLoading(true);
    try {
      // Use the logged-in user's ID as the commissionerId
      const commissionerId = user.userId; // Adjust based on your user object (e.g., user._id)
      const newLeague = await createLeague(leagueName, commissionerId);
      console.log('League created:', newLeague);
      navigation.goBack();
    } catch (error) {
      console.error('Error creating league:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <LinearGradient
      colors={['#f8fafc', '#e2e8f0']}
      style={styles.container}
    >
      <Animated.View 
        entering={LightSpeedInRight.duration(500)}
        exiting={LightSpeedOutLeft}
      >
        {/* Centered Main Title */}
        <Text style={[styles.title, { fontFamily: 'Pacifico' }]}>
          Create League
        </Text>

        {/* League Name Input */}
        <Animated.View entering={FadeInUp.delay(200).springify()}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              League Name
            </Text>
            <AnimatedTextInput
              style={[styles.textInput, errorAnimation]}
              placeholder="Enter league name..."
              value={leagueName}
              onChangeText={setLeagueName}
              selectionColor="#4f46e5"
            />
            {showError && (
              <Animated.Text
                entering={FadeInDown}
                exiting={FadeInDown.duration(200)}
                style={styles.errorText}
              >
                League name is required!
              </Animated.Text>
            )}
          </View>
        </Animated.View>

        {/* Invite Code Input (Optional) */}
        <Animated.View entering={FadeInUp.delay(300).springify()}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Invite Code (optional)
            </Text>
            <AnimatedTextInput
              style={styles.textInput}
              placeholder="Custom invite code..."
              value={inviteCode}
              onChangeText={setInviteCode}
              selectionColor="#4f46e5"
            />
          </View>
        </Animated.View>

        {/* Create League Button */}
        <Animated.View entering={FadeInUp.delay(400).springify()}>
          <AnimatedButton
            onPress={handleCreate}
            activeOpacity={0.8}
            style={[styles.button, { opacity: !leagueName ? 0.5 : 1 }]}
            disabled={!leagueName || loading}
          >
            <LinearGradient
              colors={['#6366f1', '#4338ca']}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="trophy" size={24} color="white" style={styles.icon} />
                <Text style={styles.buttonText}>
                  {loading ? 'Creating...' : 'Create League'}
                </Text>
              </View>
            </LinearGradient>
          </AnimatedButton>
        </Animated.View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#2d3436',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 8,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 8,
  },
  button: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
