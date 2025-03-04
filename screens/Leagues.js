import React, { useEffect, useState } from 'react';
import { View, Text, SectionList, RefreshControl, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { 
  FadeInRight,
  FadeInDown,
  Layout,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import { fetchLeagues, fetchUserLeagues } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AnimatedTouchable = Animated.createAnimatedComponent(View);

export default function Leagues() {
  const navigation = useNavigation();
  const { user } = useAuth(); // Use the AuthContext here

  const [userLeagues, setUserLeagues] = useState([]);
  const [allLeagues, setAllLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // State for pull-to-refresh
  const [searchTerm, setSearchTerm] = useState(''); // State for search input

  let [fontsLoaded] = useFonts({
    Pacifico: Pacifico_400Regular,
  });

  // Reusable function to fetch leagues data
  const fetchData = async () => {
    try {
      if (user) {
        // Fetch leagues the user has joined
        const userLeaguesData = await fetchUserLeagues(user.userId);
        setUserLeagues(userLeaguesData);
      } else {
        // Clear user leagues if no user is logged in
        setUserLeagues([]);
      }
      // Fetch all available leagues
      const allLeaguesData = await fetchLeagues();
      setAllLeagues(allLeaguesData);
    } catch (error) {
      console.error('Error fetching leagues:', error);
    }
  };

  // Function to load data initially
  const loadData = async () => {
    setLoading(true);
    await fetchData();
    setLoading(false);
  };

  // Function to handle pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Fetch data on component mount or when user changes
  useEffect(() => {
    loadData();
  }, [user]);

  // Return null if fonts are not loaded
  if (!fontsLoaded) {
    return null;
  }

  // Filter the allLeagues array based on the search term
  const filteredAllLeagues = allLeagues.filter(league =>
    league.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Define the two sections for the SectionList
  const sections = [
    {
      title: 'Your Leagues',
      data: user ? userLeagues : [],
      renderEmpty: () =>
        user ? (
          <View style={{ alignItems: 'center', padding: 16 }}>
            <Ionicons name="sad-outline" size={48} color="#94a3b8" style={{ marginBottom: 8 }} />
            <Text style={{ color: '#94a3b8', fontSize: 18, textAlign: 'center' }}>
              You haven't joined any leagues yet.
            </Text>
          </View>
        ) : (
          <View style={{ alignItems: 'center', padding: 16 }}>
            <Ionicons name="sad-outline" size={48} color="#94a3b8" style={{ marginBottom: 8 }} />
            <Text style={{ color: '#94a3b8', fontSize: 18, textAlign: 'center' }}>
              Ooops! Looks like you are not logged in.
            </Text>
          </View>
        ),
    },
    {
      title: 'All Leagues',
      // Use the filtered results for the All Leagues section
      data: filteredAllLeagues,
      renderEmpty: () => (
        <View style={{ alignItems: 'center', padding: 16 }}>
          <Ionicons name="sad-outline" size={48} color="#94a3b8" style={{ marginBottom: 8 }} />
          <Text style={{ color: '#94a3b8', fontSize: 18, textAlign: 'center' }}>
            No leagues available at the moment.
          </Text>
        </View>
      ),
    },
  ];

  // Render each league item
  const renderLeagueItem = ({ item, index }) => (
    <AnimatedTouchable
      entering={FadeInRight.delay(index * 100).duration(500)}
      layout={Layout.springify()}
      style={{ marginBottom: 16 }}
      onTouchEnd={() => navigation.navigate('LeagueDetail', { leagueId: item.id })}
    >
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={{
          padding: 16,
          borderRadius: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2d3436' }}>{item.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: '#64748b' }}>{item.membersCount || 0} members</Text>
            <Ionicons name="people" size={16} color="#64748b" style={{ marginLeft: 8 }} />
            <Ionicons name="chevron-forward" size={24} color="#94a3b8" style={{ marginLeft: 8 }} />
          </View>
        </View>
      </LinearGradient>
    </AnimatedTouchable>
  );

  // Render section header and conditionally add a search bar for "All Leagues"
  const renderSectionHeader = ({ section: { title } }) => (
    <View style={{ marginBottom: 8, alignItems: 'center' }}>
      <Text style={{ fontFamily: 'Pacifico', fontSize: 32, color: '#2d3436' }}>
        {title}
      </Text>
      {title === 'All Leagues' && (
        <>
          <Ionicons name="american-football-outline" size={24} color="#4338ca" style={{ marginTop: 4 }} />
          <TextInput
            style={{
              marginTop: 8,
              width: '90%',
              padding: 8,
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 8,
              backgroundColor: 'white',
            }}
            placeholder="Search Leagues..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f0f0', padding: 16 }}>
      {loading ? (
        <Text style={{ textAlign: 'center', fontSize: 18 }}>Loading leagues...</Text>
      ) : (
        <>
          {/* Animated Create Button placed above the "Your Leagues" section */}
          <AnimatedTouchable
            entering={FadeInDown.duration(800)}
            layout={Layout.springify()}
            style={{ marginBottom: 16 }}
            onTouchEnd={() => navigation.navigate('CreateLeague')}
          >
            <LinearGradient
              colors={['#6366f1', '#4338ca']}
              style={{
                padding: 16,
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="add-circle" size={24} color="white" />
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18, marginLeft: 8 }}>
                Create New League
              </Text>
            </LinearGradient>
          </AnimatedTouchable>
          
          {/* SectionList with pull-to-refresh functionality */}
          <SectionList
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#6366f1" // Color of the refresh spinner
                colors={['#6366f1']} // Android-specific: color of the refresh spinner
              />
            }
            sections={sections}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderLeagueItem}
            renderSectionHeader={renderSectionHeader}
            renderSectionFooter={({ section }) => {
              if (section.data.length === 0 && section.renderEmpty) {
                return section.renderEmpty();
              }
              return null;
            }}
            stickySectionHeadersEnabled={false}
          />
        </>
      )}
    </View>
  );
}
