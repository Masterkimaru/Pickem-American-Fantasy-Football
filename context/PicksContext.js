import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  fetchGames,
  fetchLeaderboard,
  fetchUserPicks,
  updatePick as apiUpdatePick,
  deletePick as apiDeletePick,
  fetchCurrentWeekLockTime, // Imported to fetch current week data
} from '../services/api';
// Import the Auth Context to access the logged-in user
import { useAuth } from './AuthContext';

// Create PicksContext and export it
export const PicksContext = createContext();

export const usePicks = () => useContext(PicksContext);

export const PicksProvider = ({ children }) => {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [games, setGames] = useState([]);
  const [picks, setPicks] = useState({}); // This will hold the user’s picks mapped by game ID
  const [leaderboard, setLeaderboard] = useState([]);
  const { user } = useAuth();

  // Fetch the current week from the backend on mount
  useEffect(() => {
    const fetchWeek = async () => {
      try {
        const response = await fetchCurrentWeekLockTime();
        // Capture only the week field from the response
        setCurrentWeek(response.week);
      } catch (error) {
        console.error('Error fetching current week:', error);
      }
    };

    fetchWeek();
  }, []);

  // Load game data and user picks whenever the current week or user changes
  useEffect(() => {
    loadWeekData(currentWeek);
    if (user) {
      loadUserPicks(user.userId);
    } else {
      setPicks({});
    }
  }, [currentWeek, user]);

  // Load games for the current week
  const loadWeekData = async (week) => {
    try {
      const response = await fetchGames(week);

      // Helper to generate a 3-letter abbreviation
      const generateAbbreviation = (teamName) => {
        if (!teamName) return '???';
        return teamName.slice(0, 3).toUpperCase();
      };

      const transformedGames = (response.games || []).map((game) => ({
        ...game,
        homeTeam: {
          name: game.homeTeam,
          abbreviation: generateAbbreviation(game.homeTeam),
          logo: { uri: game.homeTeamLogo },
        },
        awayTeam: {
          name: game.awayTeam,
          abbreviation: generateAbbreviation(game.awayTeam),
          logo: { uri: game.awayTeamLogo },
        },
        spread: game.pointSpread,
      }));

      setGames(transformedGames);

      const leaderboardData = await fetchLeaderboard();
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error loading week data:', error);
    }
  };

  // Load existing picks for the user
  const loadUserPicks = async (userId) => {
    try {
      const data = await fetchUserPicks(userId);
      const userPicks = {};
      if (data.leagues) {
        Object.values(data.leagues).forEach((leagueData) => {
          if (leagueData.weeks && leagueData.weeks[currentWeek]) {
            leagueData.weeks[currentWeek].forEach((pick) => {
              userPicks[pick.gameId] = { team: pick.selectedTeam, pickId: pick.id };
            });
          }
        });
      }
      setPicks(userPicks);
    } catch (error) {
      console.error('Error loading user picks:', error);
    }
  };

  // Make a new pick for a game (local only)
  const handleMakePick = (gameId, team) => {
    if (!user) {
      console.error('User is not logged in. Cannot make pick.');
      return;
    }

    // Simply update the local state with the new pick.
    // The pick will be submitted only when the user confirms.
    setPicks((prev) => ({
      ...prev,
      [gameId]: { team },
    }));
  };

  // Update an existing pick for a game (if needed after submission)
  const updateUserPick = async () => {
    if (!user) return;
    // Create an array from your picks state, filtering out invalid picks
    const picksToUpdate = Object.values(picks)
      .filter((pick) => pick.pickId) // Only include picks with a valid pickId
      .map((pick) => ({
        pickId: pick.pickId,
        selectedTeam: pick.team,
      }));

    if (picksToUpdate.length === 0) {
      console.error('No valid picks to update.');
      return;
    }

    try {
      const response = await apiUpdatePick(user.userId, picksToUpdate);
      console.log('Picks updated successfully:', response);
      // Update your state if necessary...
    } catch (error) {
      console.error('Error updating picks:', error);
    }
  };

  // Delete an existing pick for a game (if needed after submission)
  const deleteUserPick = async (gameId) => {
    if (!user) return;
    const currentPick = picks[gameId];
    if (!currentPick || !currentPick.pickId) {
      console.error('No existing pick to delete for this game.');
      return;
    }
    try {
      await apiDeletePick(user.userId, currentPick.pickId);
      setPicks((prev) => {
        const newPicks = { ...prev };
        delete newPicks[gameId];
        return newPicks;
      });
      console.log('Pick deleted successfully.');
    } catch (error) {
      console.error('Error deleting pick:', error);
    }
  };

  return (
    <PicksContext.Provider
      value={{
        currentWeekGames: games,
        selectedPicks: picks,
        makePick: handleMakePick,
        updatePick: updateUserPick,
        deletePick: deleteUserPick,
        leaderboard,
        currentWeek,
        setCurrentWeek,
        // Updater function to update picks state
        updateSelectedPicks: (newPicks) => setPicks(newPicks),
      }}
    >
      {children}
    </PicksContext.Provider>
  );
};
