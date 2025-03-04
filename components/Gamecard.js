import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';

const GameCard = ({
  homeTeam = { name: 'Home', abbreviation: 'HOM', logo: null },
  awayTeam = { name: 'Away', abbreviation: 'AWY', logo: null },
  spread = 0,
  status = 'Upcoming',
}) => (
  <Animatable.View
    animation="fadeInUp"
    duration={1000}
    useNativeDriver={true} // Optimize animations for better performance
    style={styles.cardContainer}
  >
    <View style={styles.row}>
      <TeamDisplay team={homeTeam} isFavorite={spread > 0} />
      <Text style={styles.vsText}>VS</Text>
      <TeamDisplay team={awayTeam} isFavorite={spread < 0} />
    </View>
    <Text style={styles.spreadText}>
      Spread: {formatSpread(spread)} | {status}
    </Text>
  </Animatable.View>
);

const TeamDisplay = ({ team, isFavorite }) => (
  <Animatable.View
    animation="fadeIn" // Simpler animation
    duration={500}
    useNativeDriver={true} // Optimize animations for better performance
    style={styles.teamContainer}
  >
    {team.logo && (
      <Image source={team.logo} style={styles.teamLogo} />
    )}
    <Text style={[styles.teamAbbreviation, isFavorite && styles.favoriteText]}>
      {team.abbreviation}
    </Text>
  </Animatable.View>
);

const formatSpread = (spread) => {
  if (spread === 0) return 'Pick\'em';
  return spread > 0 ? `+${spread}` : spread.toString();
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  vsText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  spreadText: {
    textAlign: 'center',
    color: '#4B5563',
  },
  teamContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamLogo: {
    resizeMode: 'contain',
    width: 64,
    height: 64,
    marginRight: 8,
  },
  teamAbbreviation: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B5563',
  },
  favoriteText: {
    color: 'green',
  },
});

export default GameCard;