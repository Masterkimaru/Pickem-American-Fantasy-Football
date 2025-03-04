import { createContext, useContext, useState, useEffect } from 'react';
import Constants from 'expo-constants';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

//const { BASE_URL } = Constants.expoConfig.extra; // Accessing the backend URL
const BASE_URL = 'http://192.168.8.176:3000/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [picks, setPicks] = useState([]);  // State to manage user's picks

  // Helper function to store user data in AsyncStorage
  const storeUserData = async (userData) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  // Helper function to store picks in AsyncStorage
  const storePicks = async (picks) => {
    try {
      await AsyncStorage.setItem('picks', JSON.stringify(picks));
    } catch (error) {
      console.error('Error saving picks:', error);
    }
  };

  // Load user and picks from AsyncStorage on app start
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        const storedPicks = await AsyncStorage.getItem('picks');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        if (storedPicks) {
          setPicks(JSON.parse(storedPicks));
        }
      } catch (error) {
        console.error('Error loading user or picks:', error);
      }
    };

    loadUserData();
  }, []);

  // Register user
  const register = async (name, email, password) => {
    try {
      const response = await axios.post(`${BASE_URL}/users/register`, { 
        name, 
        email, 
        password 
      });
      
      // Ensure the backend returns the user object with email
      const { user: userResponse, token } = response.data;
      
      if (userResponse) {
        const userData = { 
          userId: userResponse.id, 
          name: userResponse.name, 
          email: userResponse.email, // Include email here
          token 
        };
        setUser(userData);
        await storeUserData(userData);
      }

      return response.data;
    } catch (error) {
      console.error('Error registering user:', error.response?.data || error.message);
      throw error;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${BASE_URL}/users/login`, { 
        email, 
        password 
      });
      
      // Ensure the backend returns the user object with email
      const { user: userResponse, token } = response.data;

      if (userResponse) {
        const userData = { 
          userId: userResponse.id, 
          name: userResponse.name, 
          email: userResponse.email, // Include email here
          token 
        };
        setUser(userData);
        await storeUserData(userData);
      }

      return response.data;
    } catch (error) {
      console.error('Error logging in:', error.response?.data || error.message);
      throw error;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user'); // Clear stored user data
      await AsyncStorage.removeItem('picks'); // Clear stored picks
      setUser(null);
      setPicks([]); // Clear picks from state
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Submit picks for the user
  const submitPicks = async (userId, picksData) => {
    try {
      const response = await axios.post(`${BASE_URL}/picks/confirm`, {
        userId,
        picks: picksData
      });

      // Assuming backend returns updated picks with pickIds
      const updatedPicks = response.data.updatedPicks;
      await storePicks(updatedPicks);
      setPicks(updatedPicks);  // Update the state with the new picks

      return response.data;
    } catch (error) {
      console.error('Error submitting picks:', error.response?.data || error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout, submitPicks, picks }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
