
const teams: Record<number, string> = {
    1: "Atlanta Hawks",
    2: "Boston Celtics",
    3: "Brooklyn Nets",
    4: "Charlotte Hornets",
    5: "Chicago Bulls",
    6: "Cleveland Cavaliers",
    7: "Dallas Mavericks",
    8: "Denver Nuggets",
    9: "Detroit Pistons",
    10: "Golden State Warriors",
    11: "Houston Rockets",
    12: "Indiana Pacers",
    13: "LA Clippers",
    14: "Los Angeles Lakers",
    15: "Memphis Grizzlies",
    16: "Miami Heat",
    17: "Milwaukee Bucks",
    18: "Minnesota Timberwolves",
    19: "New Orleans Pelicans",
    20: "New York Knicks",
    21: "Oklahoma City Thunder",
    22: "Orlando Magic",
    23: "Philadelphia 76ers",
    24: "Phoenix Suns",
    25: "Portland Trail Blazers",
    26: "Sacramento Kings",
    27: "San Antonio Spurs",
    28: "Toronto Raptors",
    29: "Utah Jazz",
    30: "Washington Wizards",
    37: "Chicago Stags",
    38: "St. Louis Bombers",
    39: "Cleveland Rebels",
    40: "Detroit Falcons",
    41: "Toronto Huskies",
    42: "Washington Capitols",
    43: "Providence Steamrollers",
    44: "Pittsburgh Ironmen",
    45: "Baltimore Bullets",
    46: "Indianapolis Jets",
    47: "Anderson Packers",
    48: "Waterloo Hawks",
    49: "Indianapolis Olympians",
    50: "Denver Nuggets",
    51: "Sheboygan Redskins"
  };

interface GameStats {
    gameId: number;
    gameDate: string;
    playerTeamId: number;
    playerTeamName: string;
    home_team: boolean;
    opponentTeamId: number;
    opponentTeamName: string;
    points: number;
    rebounds: number;
    assists: number;
    steals: number;
    blocks: number;
    fgPercentage: number;
    minutesPlayed: number;
}

export async function fetch_all_games(player_id:number): Promise<GameStats[] | undefined>  {

    let allGames: GameStats[] = [];
    let page = 1;
    let totalPages = 1;

    while(page <= totalPages) {
        const response = await fetch(`https://api.balldontlie.io/v1/stats?player_ids[]=${player_id}&per_page=100&page=${page}`, {
        headers: {
            'Authorization': `${process.env.NBA_STATS_API_KEY}`
        }
    })
    if (response.ok) {
        const data = await response.json()
        totalPages = data.meta.total_pages;
        page++;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const games = data.data.map((game:any) => ({
            gameId: game.game.id,
            gameDate: game.game.date,
            playerTeamId: game.team.id,
            playerTeamName: game.team.full_name,
            home_team: game.game.home_team_id === game.team.id ? true : false,
            opponentTeamId: game.game.home_team_id === game.team.id ? game.game.visitor_team_id : game.game.home_team_id,
            opponentTeamName: teams[game.game.home_team_id === game.team.id ? game.game.visitor_team_id : game.game.home_team_id],
            points: game.pts,
            rebounds: game.reb,
            assists: game.ast,
            steals: game.stl,
            blocks: game.blk,
            fgPercentage: game.fg_pct,
            minutesPlayed: game.min
        }))
        
        allGames = allGames.concat(games)
        console.log(allGames)
        return allGames
    } else {
        console.error('Error:', response.status, response.statusText)
        return []
    }
}
} 











