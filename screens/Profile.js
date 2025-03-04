import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function Profile() {
  const { user, register, login, logout } = useAuth();
  const titleRotation = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  
  // New animated value for the NFL football rotation
  const loadingRotation = useRef(new Animated.Value(0)).current;

  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Title rotation animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(titleRotation, {
          toValue: 1,
          duration: 5000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(titleRotation, {
          toValue: 0,
          duration: 5000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [titleRotation]);

  // Start loading animation when isLoading is true
  useEffect(() => {
    let animation;
    if (isLoading) {
      loadingRotation.setValue(0);
      animation = Animated.loop(
        Animated.timing(loadingRotation, {
          toValue: 1,
          duration: 1000, // one full rotation per second
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      animation.start();
    } else {
      // Stop the animation if needed
      loadingRotation.stopAnimation();
    }
    // Cleanup: stop the animation on unmount or when isLoading changes.
    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [isLoading, loadingRotation]);

  // Interpolation for title rotation
  const rotateInterpolate = titleRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '5deg'],
  });

  // Interpolation for loading rotation (0 to 360 degrees)
  const loadingSpin = loadingRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const cardAnimatedStyle = {
    transform: [{ perspective: 1000 }, { rotateX: rotateInterpolate }],
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  };

  const handleInputChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const requiredFields = isRegistering 
      ? ['name', 'email', 'password'] 
      : ['email', 'password'];

    const emptyCount = requiredFields.filter(
      (field) => form[field].trim() === ''
    ).length;

    if (emptyCount === requiredFields.length) {
      setError('No fields have been filled!');
      return;
    } else if (emptyCount > 0) {
      setError('There is one or more empty fields. Please fill out all the fields!');
      return;
    } else {
      setError('');
    }

    setIsLoading(true); // start loading

    try {
      if (isRegistering) {
        await register(form.name, form.email, form.password);
      } else {
        await login(form.email, form.password);
      }
      setForm({ name: '', email: '', password: '' });
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setIsLoading(false); // end loading regardless of outcome
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.Text style={[styles.title, { transform: [{ rotateZ: rotateInterpolate }] }]}>
          {isRegistering ? 'Register' : 'Login'}
        </Animated.Text>
        {error !== '' && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        <Animated.View style={[styles.card, cardAnimatedStyle]}>
          {isRegistering && (
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={form.name}
              onChangeText={(text) => handleInputChange('name', text)}
            />
          )}
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(text) => handleInputChange('email', text)}
          />
          <View style={{ position: 'relative' }}>
            <TextInput
              style={[styles.input, { paddingRight: 40 }]}
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={form.password}
              onChangeText={(text) => handleInputChange('password', text)}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: 10, top: '50%', transform: [{ translateY: -12 }] }}
            >
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#ccc" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            onPressIn={() =>
              Animated.spring(buttonScale, { toValue: 0.95, useNativeDriver: true }).start()
            }
            onPressOut={() =>
              Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start()
            }
            disabled={isLoading} // disable button while loading
          >
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <LinearGradient
                colors={['#4c669f', '#3b5998', '#192f6a']}
                style={styles.gradientButton}
              >
                {isLoading ? (
                  // Show NFL football loading indicator when loading
                  <Animated.Image
                    source={require('../assets/football.png')} // Place your realistic NFL football image here
                    style={[styles.loadingIcon, { transform: [{ rotate: loadingSpin }] }]}
                  />
                ) : (
                  <Text style={styles.buttonText}>
                    {isRegistering ? 'Register' : 'Login'}
                  </Text>
                )}
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
            style={styles.toggleButton}
          >
            <Text style={styles.toggleButtonText}>
              {isRegistering
                ? 'Already have an account? Login'
                : "Don't have an account? Register"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.Text style={[styles.title, { transform: [{ rotateZ: rotateInterpolate }] }]}>
        My Profile
      </Animated.Text>
      <Animated.View style={[styles.card, cardAnimatedStyle]}>
        <Text style={styles.userText}>
          Name: <Text style={styles.infoText}>{user.name}</Text>
        </Text>
        <Text style={styles.userText}>
          Email: <Text style={styles.infoText}>{user.email}</Text>
        </Text>
        <TouchableOpacity
          onPress={logout}
          onPressIn={() =>
            Animated.spring(buttonScale, { toValue: 0.95, useNativeDriver: true }).start()
          }
          onPressOut={() =>
            Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start()
          }
        >
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <LinearGradient
              colors={['#ff0000', '#cc0000', '#990000']}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Logout</Text>
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 20,
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
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    transform: [{ perspective: 1000 }],
  },
  userText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#0984e3',
  },
  infoText: {
    color: '#0984e3',
    fontWeight: 'bold',
  },
  gradientButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  // Remove the passwordContainer style since we're not using it anymore.
  eyeIcon: {
    padding: 10,
  },
  toggleButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: '#4c669f',
    fontSize: 14,
  },
  // New style for the loading icon
  loadingIcon: {
    width: 30,
    height: 30,
  },
});
