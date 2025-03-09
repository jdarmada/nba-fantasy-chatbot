import { elasticClient, checkIndex } from './elasticClient';

const teams: Record<number, string> = {
    1: 'Atlanta Hawks',
    2: 'Boston Celtics',
    3: 'Brooklyn Nets',
    4: 'Charlotte Hornets',
    5: 'Chicago Bulls',
    6: 'Cleveland Cavaliers',
    7: 'Dallas Mavericks',
    8: 'Denver Nuggets',
    9: 'Detroit Pistons',
    10: 'Golden State Warriors',
    11: 'Houston Rockets',
    12: 'Indiana Pacers',
    13: 'LA Clippers',
    14: 'Los Angeles Lakers',
    15: 'Memphis Grizzlies',
    16: 'Miami Heat',
    17: 'Milwaukee Bucks',
    18: 'Minnesota Timberwolves',
    19: 'New Orleans Pelicans',
    20: 'New York Knicks',
    21: 'Oklahoma City Thunder',
    22: 'Orlando Magic',
    23: 'Philadelphia 76ers',
    24: 'Phoenix Suns',
    25: 'Portland Trail Blazers',
    26: 'Sacramento Kings',
    27: 'San Antonio Spurs',
    28: 'Toronto Raptors',
    29: 'Utah Jazz',
    30: 'Washington Wizards',
    37: 'Chicago Stags',
    38: 'St. Louis Bombers',
    39: 'Cleveland Rebels',
    40: 'Detroit Falcons',
    41: 'Toronto Huskies',
    42: 'Washington Capitols',
    43: 'Providence Steamrollers',
    44: 'Pittsburgh Ironmen',
    45: 'Baltimore Bullets',
    46: 'Indianapolis Jets',
    47: 'Anderson Packers',
    48: 'Waterloo Hawks',
    49: 'Indianapolis Olympians',
    50: 'Denver Nuggets',
    51: 'Sheboygan Redskins',
};

interface GameStats {
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

interface Team {
    id: number;
    abbreviation: string;
    city: string;
    conference: string;
    division: string;
    full_name: string;
    name: string;
}

interface Game {
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

interface ApiResponse {
    data: Game[];
    meta: {
        total_pages: number;
        current_page: number;
        next_page: number | null;
        per_page: number;
        total_count: number;
    };
}

interface GameResult {
    gameId: number;
    date: string;
    status: string;
    season: number;
    team: string;
    opponent: string;
    location: 'home' | 'away';
    venueDetails: string;
}

interface ErrorResult {
    error: string;
}

async function getNextUpcomingMatchup(
    teamId: number
): Promise<GameResult | ErrorResult> {
    // Get current date
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];

    // Get current time in hours and minutes
    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();

    // Fetch upcoming games for the specified team
    const url = `https://api.balldontlie.io/v1/games?team_ids[]=${teamId}&start_date=${formattedToday}&per_page=100`;

    try {
        const response = await fetch(url);
        const data: ApiResponse = await response.json();

        if (!data.data || data.data.length === 0) {
            return { error: 'No upcoming games found for this team.' };
        }

        // Sort games
        const sortedGames = data.data.sort((a, b) => {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

        // Find the first game that hasn't started yet
        for (const game of sortedGames) {
            // Parse game time
            const gameDate = new Date(game.date);
            const gameHour = gameDate.getHours();
            const gameMinute = gameDate.getMinutes();

            // Check today's game
            const isGameToday =
                gameDate.toISOString().split('T')[0] === formattedToday;

            // Check if game has started
            if (isGameToday) {
                // Compare times
                if (
                    currentHour < gameHour ||
                    (currentHour === gameHour && currentMinute < gameMinute)
                ) {
                    return formatGameResponse(game, teamId);
                }
            } else {
                return formatGameResponse(game, teamId);
            }
        }

        return { error: 'No upcoming games' };
    } catch (error) {
        return { error: `Error fetching games` };
    }
}

// Helper to format response
function formatGameResponse(game: Game, teamId: number): GameResult {
    const isHomeTeam = game.home_team.id === teamId;
    const team = isHomeTeam ? game.home_team : game.visitor_team;
    const opponent = isHomeTeam ? game.visitor_team : game.home_team;

    return {
        gameId: game.id,
        date: game.date,
        status: game.status,
        season: game.season,
        team: team.full_name,
        opponent: opponent.full_name,
        location: isHomeTeam ? 'home' : 'away',
        venueDetails: `${isHomeTeam ? 'vs' : '@'} ${opponent.full_name}`,
    };
}

export async function get_player_id(playerName: string) {
    const [first_name, last_name] = playerName;
    try {
        const response = await fetch(
            `https://api.balldontlie.io/v1/players?first_name=${first_name}&last_name=${last_name}`,
            {
                headers: {
                    Authorization: `${process.env.NBA_STATS_API_KEY}`,
                },
            }
        );
        if (response.ok) {
            const data = await response.json();
            const playerInfo = [data.data.id, data.data.team.id];
            return playerInfo;
        }
    } catch (error) {
        console.error(error);
    }
}

export async function fetch_all_games(
    player_id: number
): Promise<GameStats[] | undefined> {
    let allGames: GameStats[] = [];
    let nextCursor: string | null = null;

    while (true) {
        let url = `https://api.balldontlie.io/v1/stats?player_ids[]=${player_id}&per_page=100`;

        if (nextCursor) {
            url += `&cursor=${nextCursor}`;
        }

        const response = await fetch(url, {
            headers: {
                Authorization: `${process.env.NBA_STATS_API_KEY}`,
            },
        });

        if (response.ok) {
            const data = await response.json();

            const games = data.data.map((game: any) => ({
                game_id: game.game.id,
                game_date: game.game.date,
                player_id: game.player.id,
                player_full_name: `${game.player.first_name} ${game.player.last_name}`,
                player_team_id: game.team.id,
                player_team_name: game.team.full_name,
                home_team: game.game.home_team_id === game.team.id,
                opponent_team_id:
                    game.game.home_team_id === game.team.id
                        ? game.game.visitor_team_id
                        : game.game.home_team_id,
                opponent_team_name:
                    teams[
                        game.game.home_team_id === game.team.id
                            ? game.game.visitor_team_id
                            : game.game.home_team_id
                    ],
                points: game.pts,
                rebounds: game.reb,
                assists: game.ast,
                steals: game.stl,
                blocks: game.blk,
                fg_percentage: game.fg_pct,
                minutes_played: game.min,
            }));

            allGames = allGames.concat(games);

            // Check if there is a next_cursor for pagination
            if (data.meta.next_cursor) {
                nextCursor = data.meta.next_cursor;
            } else {
                break;
            }
        } else {
            console.error('Error:', response.status, response.statusText);
            return [];
        }
    }

    return allGames;
}

async function storeAllGames(player_id: number): Promise<void> {
    await checkIndex('career-stats');

    const careerGames = await fetch_all_games(player_id);

    if (!careerGames || !careerGames.length) {
        console.log('No career games found');
        return;
    }

    const bulkResponse = await elasticClient.helpers.bulk({
        datasource: careerGames,

        onDocument(doc) {
            return {
                index: { _index: 'career-stats' },
            };
        },
    });
    const itemCount = await elasticClient.count({ index: 'career-stats' });
    console.log(`Ingested ${itemCount.count} documents`);
}
