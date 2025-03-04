// PendingMembers.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { fetchMembershipRecord, acceptRequest, rejectRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useRoute } from '@react-navigation/native';

export default function PendingMembersScreen() {
  const { user } = useAuth();
  const route = useRoute();
  const { leagueId } = route.params;

  const [pendingMembers, setPendingMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to load pending members
  const loadPendingMembers = async () => {
    try {
      const data = await fetchMembershipRecord(leagueId);
      setPendingMembers(data);
    } catch (error) {
      console.error('Error fetching pending members:', error);
      Alert.alert('Error', 'Unable to load pending members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingMembers();
  }, [leagueId]);

  // Accept a pending request
  const handleAccept = async (requestId) => {
    try {
      await acceptRequest(leagueId, requestId, user.userId);
      Alert.alert('Success', 'Member accepted successfully');
      loadPendingMembers(); // refresh list after accepting
    } catch (error) {
      Alert.alert('Error', 'Failed to accept member');
    }
  };

  // Reject a pending request
  const handleReject = async (requestId) => {
    try {
      await rejectRequest(leagueId, requestId, user.userId);
      Alert.alert('Success', 'Member rejected successfully');
      loadPendingMembers(); // refresh list after rejecting
    } catch (error) {
      Alert.alert('Error', 'Failed to reject member');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading pending members...</Text>
      </View>
    );
  }

  if (pendingMembers.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>No pending members</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={pendingMembers}
        keyExtractor={(item) => item.id.toString()} // assuming each pending record has an 'id'
        renderItem={({ item }) => (
          <View style={styles.memberItem}>
            <Text style={styles.memberName}>{item.user.name}</Text>
            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={styles.acceptButton} onPress={() => handleAccept(item.id)}>
                <Text style={styles.buttonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.rejectButton} onPress={() => handleReject(item.id)}>
                <Text style={styles.buttonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  memberName: {
    fontSize: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
  },
  acceptButton: {
    backgroundColor: '#34D399',
    padding: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  rejectButton: {
    backgroundColor: '#EF4444',
    padding: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
