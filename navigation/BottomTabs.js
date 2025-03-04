import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { Path, Svg } from 'react-native-svg';
import { Dimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Home from '../screens/Home';
import Leaderboard from '../screens/Leaderboard';
import Profile from '../screens/Profile';
import LeagueNavigator from './LeagueNavigator';


const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');
const TAB_COUNT = 4;
const TAB_WIDTH = width / TAB_COUNT;
const AnimatedSvg = Animated.createAnimatedComponent(Svg);

export default function BottomTabs() {
  const activeIndex = useSharedValue(0);

  const TabBar = ({ state, navigation }) => {
    return (
      <View className="absolute bottom-0 left-0 right-0">
        <LinearGradient
          colors={['#1e3c72', '#2a5298']}
          className="h-28 pb-4"
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
          }}
        >
          {/* Top Wave Animation */}
          <AnimatedSvg
            width={TAB_WIDTH * 1.5}
            height={40}
            style={useAnimatedStyle(() => ({
              position: 'absolute',
              top: -35, // Position above the tab bar
              left: withSpring(activeIndex.value * TAB_WIDTH - TAB_WIDTH * 0.25),
            }))}
          >
            <Path
              d={`M 0 35 Q ${TAB_WIDTH * 0.4} 0 ${TAB_WIDTH * 0.75} 35 T ${TAB_WIDTH * 1.5} 35`}
              fill="#4FD1C5"
              stroke="#4FD1C5"
              strokeWidth="2"
            />
          </AnimatedSvg>

          {state.routes.map((route, index) => {
            const isActive = state.index === index;
            const onPress = () => {
              activeIndex.value = index;
              navigation.navigate(route.name);
            };

            const getIcon = () => {
              switch(route.name) {
                case 'Home':
                  return <Ionicons name={isActive ? 'home' : 'home-outline'} size={30} color="white" />;
                case 'Leaderboard':
                  return <MaterialIcons name="leaderboard" size={30} color="white" />;
                case 'Leagues':
                  return <FontAwesome5 name="users" size={26} color="white" />;
                
                case 'Profile':
                  return <Ionicons name={isActive ? 'person' : 'person-outline'} size={30} color="white" />;
              }
            };

            return (
              <Animated.View
                key={route.key}
                style={{
                  width: TAB_WIDTH,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingTop: 12,
                  marginTop: 20 // Add space for the wave
                }}
                onTouchEnd={onPress}
              >
                {getIcon()}
                <Animated.Text className="text-white text-sm mt-2">
                  {route.name}
                </Animated.Text>
              </Animated.View>
            );
          })}
        </LinearGradient>
      </View>
    );
  };

  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tab.Screen name="Home">
        {(props) => <Home {...props} />}
      </Tab.Screen>
      <Tab.Screen name="Leaderboard" component={Leaderboard} />
      <Tab.Screen name="Leagues" component={LeagueNavigator} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}