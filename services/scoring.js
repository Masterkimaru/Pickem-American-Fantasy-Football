export const calculateWeeklyScores = (games, picks) => {
  return Object.entries(picks).reduce((scores, [gameId, pickedTeam]) => {
    const game = games.find(g => g.id === gameId);
    if (!game) return scores;
    
    const isCorrect = game.result 
      ? game.result.winner === pickedTeam
      : null;

    return {
      ...scores,
      [pickedTeam.userId]: (scores[pickedTeam.userId] || 0) + (isCorrect ? 1 : 0)
    };
  }, {});
};

export const updateLeaderboard = (scores) => {
  return Object.entries(scores)
    .map(([userId, points]) => ({ userId, points }))
    .sort((a, b) => b.points - a.points);
};