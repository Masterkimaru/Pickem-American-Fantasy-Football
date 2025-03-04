// import Constants from 'expo-constants';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Update this with your correct backend URL
//const { BASE_URL } = Constants.expoConfig.extra; // Accessing the new field
const BASE_URL = 'http://192.168.8.176:3000/api';

// Fetch games for the current week (determined by the backend)
export const fetchGames = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/games/current-week-games`);
    return response.data; // { week: currentWeek, games }
  } catch (error) {
    console.error('Error fetching current week games:', error.response?.data || error.message);
    throw error;
  }
};

// Submit multiple picks for games across all leagues the user is in
// Each pick in the picks array should be an object: { gameId, selectedTeam }
export const submitPicks = async (userId, picks) => {
  try {
    const response = await axios.post(`${BASE_URL}/picks/confirm`, {
      userId,
      picks,
    });

    // The backend returns the created picks in the "createdPicks" property
    const createdPicks = response.data.createdPicks;
    
    // Store pickIds in AsyncStorage or return them
    if (createdPicks) {
      await storePicks(createdPicks);
    } else {
      console.warn("No picks to store");
    }

    return response.data;
  } catch (error) {
    console.error('Error submitting picks:', error.response?.data || error.message);
    throw error;
  }
};

// Store pickIds in AsyncStorage
const storePicks = async (picks) => {
  try {
    await AsyncStorage.setItem('picks', JSON.stringify(picks));
  } catch (error) {
    // Suppress the error so it doesn't show up
    // Optionally, log it in development
    if (__DEV__) {
      console.warn("Error storing picks (ignored):", error);
    }
  }
};




// Fetch leaderboard data
export const fetchLeaderboard = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/leaderboard`);
    return response.data;
  } catch (error) {
    console.error('Error fetching leaderboard:', error.response?.data || error.message);
    throw error;
  }
};

// Fetch all leagues
export const fetchLeagues = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/leagues`);
    return response.data; // should be an array of leagues
  } catch (error) {
    console.error('Error fetching leagues:', error.response?.data || error.message);
    throw error;
  }
};

// Fetch leagues where a specific user is a member
export const fetchUserLeagues = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/leagues/user/${userId}`);

    return response.data; // Returns an array of leagues or an error message
  } catch (error) {
    console.error('Error fetching user leagues:', error.response?.data?.message || error.message);
    throw error;
  }
};

//fetch members based on a specific league
export const fetchLeagueMembers = async (leagueId) => {
  try {
    const response = await axios.get(`${BASE_URL}/league-members/${leagueId}/members`);
    return response.data; // expected to be an array of members
  } catch (error) {
    console.error('Error fetching league members:', error.response?.data || error.message);
    throw error;
  }
};

// Fetch another user by name (requires auth token)
export const fetchUserByName = async (name, token) => {
  try {
    if (!name) throw new Error('Name parameter is required');
    if (!token) throw new Error('Authentication token is required');

    const response = await axios.get(`${BASE_URL}/users/user/${name}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Expecting { user: { ... } } in the response
  } catch (error) {
    console.error(
      'Error fetching user by name:',
      error.response?.data || error.message
    );
    throw error;
  }
};


// Create a league
export const createLeague = async (name, commissionerId) => {
  try {
    const response = await axios.post(`${BASE_URL}/leagues`, {
      name,
      commissionerId,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating league:', error.response?.data || error.message);
    throw error;
  }
};


// Add a user to a league
export const addUserToLeague = async (leagueId, userId = null, name = null, commissionerId) => {
  try {
    const requestBody = {};

    if (userId) {
      requestBody.userId = userId;
    } else if (name) {
      requestBody.name = name;
    } else {
      throw new Error("Either userId or name must be provided.");
    }

    const response = await axios.post(
      `${BASE_URL}/leagues/${leagueId}/add-user`,
      requestBody,
      {
        headers: {
          userid: commissionerId, // Pass the commissioner ID in the headers as expected by the backend
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding user to league:", error.response?.data || error.message);
    throw error;
  }
};



// Close registration for a league
export const closeRegistration = async (leagueId, commissionerId) => {
  try {
    const response = await axios.post(`${BASE_URL}/leagues/${leagueId}/close-registration`, {
      commissionerId,
    });
    return response.data;
  } catch (error) {
    console.error('Error closing registration:', error.response?.data || error.message);
    throw error;
  }
};

// Reopen registration for a league
export const reopenRegistration = async (leagueId, commissionerId) => {
  try {
    const response = await axios.post(`${BASE_URL}/leagues/${leagueId}/reopen-registration`, {
      commissionerId,
    });
    return response.data;
  } catch (error) {
    console.error('Error reopening registration:', error.response?.data || error.message);
    throw error;
  }
};
// Fetch picks for a user
export const fetchUserPicks = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/picks/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user picks:', error.response?.data || error.message);
    throw error;
  }
};

// Fetch a specific user's pick for a game
export const fetchUserPickForGame = async (userId, gameId) => {
  try {
    const response = await axios.get(`${BASE_URL}/picks/${userId}/${gameId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user pick for game:', error.response?.data || error.message);
    throw error;
  }
};

// Update multiple picks at once.
// Each pick in the picks array should be an object:
// { selectedTeam, pickId? (optional), gameId? (if pickId is not provided) }
// If pickId is provided, it is used directly. Otherwise, the pick is looked up using userId and gameId.
export const updatePicks = async (userId, picks) => {
  try {
    // Ensure picks is an array
    if (!Array.isArray(picks)) {
      picks = [picks];
    }
    const response = await axios.put(`${BASE_URL}/picks/update-picks`, {
      userId,
      picks,
    });
    return response.data; // Response from the server after successful update
  } catch (error) {
    console.error('Error updating picks:', error.response?.data || error.message);
    throw error; // Re-throw error to propagate it to the caller
  }
};



// Delete a pick
export const deletePick = async (userId, pickId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/picks/${userId}/${pickId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting pick:', error.response?.data || error.message);
    throw error;
  }
};

// Fetch the lock time for the current week
export const fetchCurrentWeekLockTime = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/games/current-week/lock-time`);
    return response.data; // Should return an object like { week: number, lockTime: string }
  } catch (error) {
    console.error('Error fetching current week lock time:', error.response?.data || error.message);
    throw error;
  }
};

// Example: Create Tournament Bracket
export const createTournamentBracket = async (data, token) => {
  try {
    const response = await axios.post(`${BASE_URL}/matchups/create-tournament`, data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating tournament bracket:', error.response?.data || error.message);
    throw error;
  }
};

// Example: Update a Matchup Winner
export const updateMatchupWinner = async (matchupId, token) => {
  try {
    const response = await axios.patch(`${BASE_URL}/matchups/update-winner/${matchupId}`, null, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating matchup winner:', error.response?.data || error.message);
    throw error;
  }
};

// Fetch matchups for a given league
export const fetchMatchups = async (leagueId, token) => {
  try {
    if (!leagueId) throw new Error('leagueId is required');
    const response = await axios.get(`${BASE_URL}/matchups/${leagueId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // Return the matchups array from the response data
    return response.data.matchups;
  } catch (error) {
    console.error('Error fetching matchups:', error.response?.data || error.message);
    throw error;
  }
};

// Fetch pending membership records for a league
export const fetchMembershipRecord = async (leagueId) => {
  try {
    const response = await axios.get(`${BASE_URL}/league-members/${leagueId}/pending-members`);
    return response.data; // Expected to be an array of pending membership records
  } catch (error) {
    console.error(
      'Error fetching membership record:',
      error.response?.data || error.message
    );
    throw error;
  }
};


// Join a league
export const joinLeague = async (leagueId, userId) => {
  try {
    const response = await axios.post(`${BASE_URL}/league-members/join`, {
      leagueId,
      userId,
    });
    return response.data;
  } catch (error) {
    console.error('Error joining league:', error.response?.data || error.message);
    throw error;
  }
};

// Leave a league
export const leaveLeague = async (leagueId, userId) => {
  try {
    const response = await axios.post(`${BASE_URL}/league-members/leave`, {
      leagueId,
      userId,
    });
    return response.data;
  } catch (error) {
    console.error('Error leaving league:', error.response?.data || error.message);
    throw error;
  }
};

// Fetch pending join requests for a league (Commissioner-only)
export const getPendingRequests = async (leagueId, commissionerId) => {
  try {
    const response = await axios.get(`${BASE_URL}/leagues/${leagueId}/pending-requests`, {
      headers: {
        userid: commissionerId, // Pass the commissioner ID in the headers
      },
    });
    return response.data; // Returns an array of pending requests
  } catch (error) {
    console.error('Error fetching pending requests:', error.response?.data || error.message);
    throw error;
  }
};

// Accept a pending join request (Commissioner-only)
export const acceptRequest = async (leagueId, requestId, commissionerId) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/leagues/${leagueId}/requests/${requestId}/accept`,
      null, // No body is needed for this request
      {
        headers: {
          userid: commissionerId, // Pass the commissioner ID in the headers
        },
      }
    );
    return response.data; // Returns the updated request
  } catch (error) {
    console.error('Error accepting request:', error.response?.data || error.message);
    throw error;
  }
};

// Reject a pending join request (Commissioner-only)
export const rejectRequest = async (leagueId, requestId, commissionerId) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/leagues/${leagueId}/requests/${requestId}/reject`,
      {
        headers: {
          userid: commissionerId, // Pass the commissioner ID in the headers
        },
      }
    );
    return response.data; // Returns a success message
  } catch (error) {
    console.error('Error rejecting request:', error.response?.data || error.message);
    throw error;
  }
};

// Delete a tournament (matchups associated with a tournamentId) by an authenticated league member
export const deleteTournament = async (leagueId, token) => {
  try {
    if (!leagueId) throw new Error("League ID is required.");
    if (!token) throw new Error("Authorization token is required.");

    const response = await axios.delete(`${BASE_URL}/matchups/delete/${leagueId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting matchups:",
      error.response?.data || error.message
    );
    throw error;
  }
};


