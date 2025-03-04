// styles.js
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  teamLogo: {
    width: 64,
    height: 64,
    marginBottom: 8,
  },
  teamName: {
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
  },
  vsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4b5563',
  },
  spreadText: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 20,
  },
});