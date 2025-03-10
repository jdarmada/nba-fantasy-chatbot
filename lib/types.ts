export interface GameStats {
    game_id: number;
    game_date: string;
    player_id: number;
    player_full_name: string;
    player_team_id: number;
    player_team_name: string;
    home_team: boolean;
    opponent_team_id: number;
    opponent_team_name: string;
    points: number;
    rebounds: number;
    assists: number;
    steals: number;
    blocks: number;
    fg_percentage: number;
    minutes_played: number;
}

export interface Team {
    id: number;
    abbreviation: string;
    city: string;
    conference: string;
    division: string;
    full_name: string;
    name: string;
}

export interface Game {
    id: number;
    date: string;
    home_team: Team;
    home_team_score: number;
    period: number;
    postseason: boolean;
    season: number;
    status: string;
    time: string;
    visitor_team: Team;
    visitor_team_score: number;
}

export interface ApiResponse {
    data: Game[];
    meta: {
        total_pages: number;
        current_page: number;
        next_page: number | null;
        per_page: number;
        total_count: number;
    };
}

export interface GameResult {
    gameId: number;
    date: string;
    status: string;
    season: number;
    team: string;
    opponent: string;
    location: 'home' | 'away';
    venueDetails: string;
}

export interface ErrorResult {
    error: string;
}


export type PlayerComparison = {
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
  };
};

export type ComparisonResult = {
  player1: PlayerComparison;
  player2: PlayerComparison;
  details: string;
};