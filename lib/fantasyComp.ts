import { getPlayerInfo, getNextUpcomingMatchup } from './ballDontLieAPI';
import { getAverages } from './elasticAggs';

type PlayerComparison = {
  name: string;
  playerId: number;
  teamId: number;
  nextOpponent: {
    teamId: number;
    teamName: string;
    gameDate: string;
    location: string;
  };
  stats: {
    seasonAverages: {
      points: number;
      rebounds: number;
      assists: number;
      steals: number;
      blocks: number;
      fgPercentage: number;
    };
    historicalAverages: {
      points: number;
      rebounds: number;
      assists: number;
      steals: number;
      blocks: number;
      fgPercentage: number;
    };
    weightedScore: number;
  };
};

type ComparisonResult = {
  player1: PlayerComparison;
  player2: PlayerComparison;
  recommendation: string;
  details: string;
};

export async function compareFantasyPlayers(player1Name: string, player2Name: string): Promise<ComparisonResult | { error: string }> {
  try {
    // Get player IDs and team IDs
    const player1Info = await getPlayerInfo(player1Name);
    const player2Info = await getPlayerInfo(player2Name);

    if (!player1Info) {
      return { error: `Could not find player: ${player1Name}` };
    }
    if (!player2Info) {
      return { error: `Could not find player: ${player2Name}` };
    }

    const [player1Id, player1TeamId] = player1Info;
    const [player2Id, player2TeamId] = player2Info;

    // Get next matchups
    const player1NextGame = await getNextUpcomingMatchup(player1TeamId);
    const player2NextGame = await getNextUpcomingMatchup(player2TeamId);

    if ('error' in player1NextGame) {
      return { error: `No upcoming games found for ${player1Name}` };
    }
    if ('error' in player2NextGame) {
      return { error: `No upcoming games found for ${player2Name}` };
    }

    // Determine opponent team IDs
    // This requires additional logic to extract the opponent team ID from the game info
    // For simplicity, I'm assuming we can infer this from the API response
    const player1OpponentId = getOpponentIdFromGameResult(player1NextGame, player1TeamId);
    const player2OpponentId = getOpponentIdFromGameResult(player2NextGame, player2TeamId);

    // Get player averages against these opponents
    const player1Stats = await getAverages(player1Id, player1OpponentId);
    const player2Stats = await getAverages(player2Id, player2OpponentId);

    if ('error' in player1Stats) {
      return { error: `Could not fetch stats for ${player1Name}` };
    }
    if ('error' in player2Stats) {
      return { error: `Could not fetch stats for ${player2Name}` };
    }

    // Calculate weighted scores (70% season, 30% historical)
    const player1Score = calculateWeightedScore(player1Stats);
    const player2Score = calculateWeightedScore(player2Stats);

    // Create comparison result
    const result: ComparisonResult = {
      player1: {
        name: player1Name,
        playerId: player1Id,
        teamId: player1TeamId,
        nextOpponent: {
          teamId: player1OpponentId,
          teamName: player1NextGame.opponent,
          gameDate: player1NextGame.date,
          location: player1NextGame.location
        },
        stats: {
          seasonAverages: player1Stats.seasonAverages,
          historicalAverages: player1Stats.historicalAverages,
          weightedScore: player1Score
        }
      },
      player2: {
        name: player2Name,
        playerId: player2Id,
        teamId: player2TeamId,
        nextOpponent: {
          teamId: player2OpponentId,
          teamName: player2NextGame.opponent,
          gameDate: player2NextGame.date,
          location: player2NextGame.location
        },
        stats: {
          seasonAverages: player2Stats.seasonAverages,
          historicalAverages: player2Stats.historicalAverages,
          weightedScore: player2Score
        }
      },
      recommendation: player1Score > player2Score ? player1Name : player2Name,
      details: generateComparisonDetails(
        player1Name, player1NextGame, player1Stats, player1Score,
        player2Name, player2NextGame, player2Stats, player2Score
      )
    };

    return result;
  } catch (error) {
    console.error('Error comparing players:', error);
    return { error: 'Failed to compare players. Please try again.' };
  }
}

// Helper function to get opponent ID from game result
function getOpponentIdFromGameResult(gameResult: any, teamId: number): number {
  // This is a placeholder - you'll need to implement the logic 
  // to extract opponent team ID from your game result structure
  // For now, returning a dummy value
  // You might need to use a team mapping or additional API call here
  
  // Example implementation (modify based on your data structure):
  const teams = gameResult.homeTeamId && gameResult.visitorTeamId 
    ? [gameResult.homeTeamId, gameResult.visitorTeamId]
    : [];
    
  return teams.find(id => id !== teamId) || 0;
}

// Calculate weighted score (70% season, 30% historical)
function calculateWeightedScore(stats: any): number {
  const seasonWeight = 0.7;
  const historicalWeight = 0.3;
  
  // Fantasy points formula - adjust based on your league's scoring system
  const calculateFantasyPoints = (stats: any) => {
    return stats.points + 
           (stats.rebounds * 1.2) + 
           (stats.assists * 1.5) + 
           (stats.steals * 3) + 
           (stats.blocks * 3) + 
           (stats.fgPercentage * 10); // Multiply FG% by 10 to give it appropriate weight
  };
  
  const seasonFantasyPoints = calculateFantasyPoints(stats.seasonAverages);
  const historicalFantasyPoints = calculateFantasyPoints(stats.historicalAverages);
  
  return (seasonFantasyPoints * seasonWeight) + (historicalFantasyPoints * historicalWeight);
}

// Generate detailed comparison text
function generateComparisonDetails(
  player1Name: string, player1Game: any, player1Stats: any, player1Score: number,
  player2Name: string, player2Game: any, player2Stats: any, player2Score: number
): string {
  return `
Fantasy Basketball Comparison:

${player1Name} (${player1Score.toFixed(2)} fantasy points)
- Next Game: ${player1Game.venueDetails} on ${new Date(player1Game.date).toLocaleDateString()}
- Season Averages vs ${player1Game.opponent}: ${player1Stats.seasonAverages.points.toFixed(1)} pts, ${player1Stats.seasonAverages.rebounds.toFixed(1)} reb, ${player1Stats.seasonAverages.assists.toFixed(1)} ast, ${player1Stats.seasonAverages.steals.toFixed(1)} stl, ${player1Stats.seasonAverages.blocks.toFixed(1)} blk, ${(player1Stats.seasonAverages.fgPercentage * 100).toFixed(1)}% FG
- Historical Averages: ${player1Stats.historicalAverages.points.toFixed(1)} pts, ${player1Stats.historicalAverages.rebounds.toFixed(1)} reb, ${player1Stats.historicalAverages.assists.toFixed(1)} ast, ${player1Stats.historicalAverages.steals.toFixed(1)} stl, ${player1Stats.historicalAverages.blocks.toFixed(1)} blk, ${(player1Stats.historicalAverages.fgPercentage * 100).toFixed(1)}% FG

${player2Name} (${player2Score.toFixed(2)} fantasy points)
- Next Game: ${player2Game.venueDetails} on ${new Date(player2Game.date).toLocaleDateString()}
- Season Averages vs ${player2Game.opponent}: ${player2Stats.seasonAverages.points.toFixed(1)} pts, ${player2Stats.seasonAverages.rebounds.toFixed(1)} reb, ${player2Stats.seasonAverages.assists.toFixed(1)} ast, ${player2Stats.seasonAverages.steals.toFixed(1)} stl, ${player2Stats.seasonAverages.blocks.toFixed(1)} blk, ${(player2Stats.seasonAverages.fgPercentage * 100).toFixed(1)}% FG
- Historical Averages: ${player2Stats.historicalAverages.points.toFixed(1)} pts, ${player2Stats.historicalAverages.rebounds.toFixed(1)} reb, ${player2Stats.historicalAverages.assists.toFixed(1)} ast, ${player2Stats.historicalAverages.steals.toFixed(1)} stl, ${player2Stats.historicalAverages.blocks.toFixed(1)} blk, ${(player2Stats.historicalAverages.fgPercentage * 100).toFixed(1)}% FG

Recommendation: Pick up ${player1Score > player2Score ? player1Name : player2Name} for your fantasy team.
`;
}