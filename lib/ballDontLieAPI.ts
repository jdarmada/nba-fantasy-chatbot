import { elasticClient, checkIndex } from "./elasticClient";

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

