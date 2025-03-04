import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Share,
  FlatList,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  withSpring,
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  fetchLeagueMembers,
  addUserToLeague,
  closeRegistration,
  reopenRegistration,
  joinLeague,
  leaveLeague,
  fetchMembershipRecord,
  fetchLeaderboard,
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function LeagueDetailScreen({ route }) {
  const { leagueId, leagueName } = route.params;
  const { user } = useAuth();
  const navigation = useNavigation();

  const [league, setLeague] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [membershipStatus, setMembershipStatus] = useState(null);

  useEffect(() => {
    const fetchLeagueData = async () => {
      try {
        // Fetch league members
        const memberData = await fetchLeagueMembers(leagueId);
        // Fetch leaderboard data (which contains totalPoints)
        const leaderboardData = await fetchLeaderboard();

        // Merge points from leaderboard for each league member
        const members = memberData.map((record, index) => {
          // Find the leaderboard entry for this user by matching the user id
          const leaderboardEntry = leaderboardData.find(
            (entry) => entry.id === record.user.id
          );
          // Use leaderboard totalPoints if available, or default to 0
          const points = leaderboardEntry ? leaderboardEntry.totalPoints : 0;
          return {
            number: index + 1,
            name: record.user.name,
            points,
            userId: record.user.id,
          };
        });

        let leagueNameFromApi = memberData?.[0]?.leagueName;
        const leagueObj = {
          id: leagueId,
          name: leagueNameFromApi || leagueName || 'League Detail',
          commissionerId: user?.userId || null,
          members,
        };
        setLeague(leagueObj);

        // Check membership status (accepted or pending)
        if (user) {
          const isAccepted = members.some(m => m.userId === user.userId);
          if (isAccepted) {
            setMembershipStatus('accepted');
          } else {
            try {
              const pendingRecords = await fetchMembershipRecord(leagueId);
              const isPending = pendingRecords.some(
                record => record.userId === user.userId
              );
              setMembershipStatus(isPending ? 'pending' : null);
            } catch (error) {
              console.error('Error fetching pending members:', error);
              setMembershipStatus(null);
            }
          }
        } else {
          setMembershipStatus(null);
        }
      } catch (error) {
        console.error('Error fetching league data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeagueData();
  }, [leagueId, leagueName, user]);
  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Loading league details...</Text>
      </View>
    );
  }

  if (!league) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error loading league details.</Text>
      </View>
    );
  }

  const sortedMembers = league.members.sort((a, b) => b.points - a.points);

  const TrophyIcon = ({ isTopMember }) => {
    const rotation = useSharedValue(0);
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${rotation.value}deg` }],
    }));

    useEffect(() => {
      if (isTopMember) {
        rotation.value = withSpring(-10, { damping: 2, stiffness: 100 });
        setTimeout(() => {
          rotation.value = withSpring(10, { damping: 2, stiffness: 100 });
        }, 200);
        setTimeout(() => {
          rotation.value = withSpring(0, { damping: 2, stiffness: 100 });
        }, 400);
      }
    }, [isTopMember]);

    return (
      <Animated.View style={animatedStyle}>
        <Ionicons name="trophy" size={24} color="#FFD700" />
      </Animated.View>
    );
  };

  const shareLeague = async (platform) => {
    const message = `Join my fantasy league "${league.name}" and compete!`;
    try {
      let url = '';
      switch (platform) {
        case 'WhatsApp':
          url = `whatsapp://send?text=${encodeURIComponent(message)}`;
          break;
        case 'Instagram':
          url = `https://www.instagram.com/`;
          break;
        case 'X':
          url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
          break;
        case 'TikTok':
          url = `https://www.tiktok.com/`;
          break;
        case 'Telegram':
          url = `tg://msg?text=${encodeURIComponent(message)}`;
          break;
        default:
          break;
      }
      if (url) {
        await Share.share({ message: `${message} \n${url}` });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const isCommissioner = user && user.userId === league.commissionerId;

  const handleAddUser = async () => {
    if (!user) {
      Alert.alert('Error', 'You need to be logged in to add a user to the league.');
      return;
    }
    if (!isCommissioner) {
      Alert.alert('Error', 'Only the commissioner can add a user to the league.');
      return;
    }
    if (!newUserId.trim()) {
      Alert.alert('Error', 'Please enter the user ID or name you want to add.');
      return;
    }
    try {
      const trimmedInput = newUserId.trim();
      // Call API based on whether the input is numeric or not
      if (isNaN(trimmedInput)) {
        await addUserToLeague(league.id, null, trimmedInput, user.userId);
      } else {
        await addUserToLeague(league.id, trimmedInput, null, user.userId);
      }

      // Optimistically update the state
      const newMember = {
        number: league.members.length + 1,
        name: trimmedInput,
        points: 0, // default points
        userId: trimmedInput, // or use the actual ID returned from the API
      };

      setLeague(prevLeague => ({
        ...prevLeague,
        members: [...prevLeague.members, newMember],
      }));

      Alert.alert('Success', 'User added to the league successfully.');
      setNewUserId('');
    } catch (error) {
      Alert.alert('Error', 'Failed to add user to the league.');
    }
  };

  const handleCloseRegistration = async () => {
    if (!user) {
      Alert.alert('Error', 'You need to be logged in to close registration.');
      return;
    }
    if (!isCommissioner) {
      Alert.alert('Error', 'Only the commissioner can close registration.');
      return;
    }
    try {
      await closeRegistration(league.id, user.userId);
      Alert.alert('Success', 'League registration closed successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to close registration.');
    }
  };

  const handleReopenRegistration = async () => {
    if (!user) {
      Alert.alert('Error', 'You need to be logged in to reopen registration.');
      return;
    }
    if (!isCommissioner) {
      Alert.alert('Error', 'Only the commissioner can reopen registration.');
      return;
    }
    try {
      await reopenRegistration(league.id, user.userId);
      Alert.alert('Success', 'League registration reopened successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to reopen registration.');
    }
  };

  const handleJoinLeave = async () => {
    if (!user) {
      Alert.alert('Error', 'You need to be logged in.');
      return;
    }
    if (membershipStatus === 'pending' || membershipStatus === 'accepted') {
      try {
        await leaveLeague(league.id, user.userId);
        setMembershipStatus(null);
        Alert.alert('Success', 'You have canceled your join request / left the league.');
        setLeague(prev => ({
          ...prev,
          members: prev.members.filter(member => member.userId !== user.userId),
        }));
      } catch (error) {
        Alert.alert('Error', 'Failed to cancel request/leave league.');
      }
    } else {
      try {
        const response = await joinLeague(league.id, user.userId);
        if (response.status === 'PENDING') {
          setMembershipStatus('pending');
          Alert.alert('Success', 'League join request submitted and is pending approval.');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to submit join request.');
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with League Title and Hamburger Menu */}
      <Animated.View
        entering={FadeIn.delay(200)}
        exiting={FadeOut}
        style={styles.headerContainer}
      >
        <Text style={styles.titleText}>{league.name}</Text>
        {isCommissioner && (
          <TouchableOpacity
            style={styles.hamburgerIcon}
            onPress={() => setMenuVisible(!menuVisible)}
          >
            <Ionicons name="menu" size={24} color="#4338ca" />
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Dropdown Menu for Registration Actions */}
      {menuVisible && (
        <View style={styles.dropdownMenu}>
          <TouchableOpacity style={styles.menuItem} onPress={handleCloseRegistration}>
            <Text style={styles.menuItemText}>Close Registration</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleReopenRegistration}>
            <Text style={styles.menuItemText}>Reopen Registration</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Matchups', { leagueId: league.id })}
          >
            <Text style={styles.menuItemText}>Matchups</Text>
          </TouchableOpacity>
          {/* NEW: Pending Members Option */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('PendingMembers', { leagueId: league.id })}
          >
            <Text style={styles.menuItemText}>Pending Members</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Grid Header */}
      <View style={styles.gridHeader}>
        <Text style={styles.headerText}>POS</Text>
        <Text style={styles.headerText}>NAME</Text>
        <Text style={styles.headerText}>USER</Text>
        <Text style={styles.headerText}>POINTS</Text>
      </View>

      {/* Members List */}
      <FlatList
        data={sortedMembers}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <Animated.View entering={SlideInUp.delay(index * 100)} style={styles.gridRow}>
            <Text style={styles.cell}>{index + 1}</Text>
            <Text style={styles.cell}>{item.name}</Text>
            <Text style={styles.cell}>User</Text>
            <Text style={styles.cell}>{item.points}</Text>
            {index === 0 && <TrophyIcon isTopMember={true} />}
          </Animated.View>
        )}
      />


      {/* Add User Input and Button */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter user ID or name to add"
          value={newUserId}
          onChangeText={setNewUserId}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddUser}>
          <Text style={styles.addButtonText}>Add User</Text>
        </TouchableOpacity>
      </View>

      {/* Invite Friends Button */}
      <TouchableOpacity
        onPress={() => setShowShareOptions(!showShareOptions)}
        activeOpacity={0.9}
        style={styles.inviteButtonContainer}
      >
        <LinearGradient
          colors={['#6366f1', '#4338ca']}
          style={styles.inviteButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="person-add-outline" size={24} color="white" />
          <Text style={styles.inviteButtonText}>Invite Friends</Text>
        </LinearGradient>
      </TouchableOpacity>

      {showShareOptions && (
        <Animated.View entering={FadeIn} style={styles.shareOptionsContainer}>
          {[
            { platform: 'WhatsApp', icon: 'logo-whatsapp', color: '#25D366' },
            { platform: 'Instagram', icon: 'logo-instagram', color: '#E1306C' },
            { platform: 'X', icon: 'logo-twitter', color: '#1DA1F2' },
            { platform: 'TikTok', icon: 'logo-tiktok', color: 'black' },
            { platform: 'Telegram', icon: 'paper-plane-outline', color: '#0088CC' },
          ].map(({ platform, icon, color }) => (
            <TouchableOpacity
              key={platform}
              onPress={() => shareLeague(platform)}
              style={styles.shareIconButton}
            >
              <Ionicons name={icon} size={28} color={color} />
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}

      {/* Join/Leave (or Cancel Request) Button */}
      {user && (
        <TouchableOpacity style={styles.joinLeaveButton} onPress={handleJoinLeave}>
          <Text style={styles.joinLeaveButtonText}>
            {membershipStatus === 'accepted'
              ? 'Leave League'
              : membershipStatus === 'pending'
              ? 'Cancel Request'
              : 'Request to Join'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#374151',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4338ca',
    textAlign: 'center',
    flex: 1,
  },
  hamburgerIcon: {
    padding: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    marginLeft: 8,
  },
  dropdownMenu: {
    marginTop: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    paddingVertical: 6,
  },
  menuItemText: {
    fontSize: 16,
    color: '#4338ca',
  },
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    flex: 1,
    textAlign: 'center',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cell: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
    textAlign: 'center',
  },
  inviteButtonContainer: {
    marginTop: 16,
  },
  inviteButton: {
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 8,
  },
  shareOptionsContainer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  shareIconButton: {
    padding: 12,
    marginHorizontal: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 50,
  },
  inputContainer: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: 'white',
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#4338ca',
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  joinLeaveButton: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#34D399',
    alignItems: 'center',
  },
  joinLeaveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
