// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { Client, type ClientOptions } from '@elastic/elasticsearch';

//Elastic Initialization
const config: ClientOptions = {
    node: `${process.env.ELASTIC_ENDPOINT}`,
    auth: {
        apiKey: `${process.env.ELASTIC_API_KEY}`,
    },
};

const client = new Client(config);

const indexName = 'career-stats';


export async function getAverages(playerId: number, opponentTeamId: number) {
  try {
    // Elasticsearch Query for Historical Averages
    const historicalQuery = await client.search({
      index: "career-stats",
      size: 0,
      query: {
        bool: {
          must: [
            { term: { playerId } }, 
            { term: { opponentTeamId } }, 
          ],
        },
      },
      aggs: {
        avg_points: { avg: { field: "points" } },
        avg_rebounds: { avg: { field: "rebounds" } },
        avg_assists: { avg: { field: "assists" } },
        avg_steals: { avg: { field: "steals" } },
        avg_blocks: { avg: { field: "blocks" } },
        avg_fg_percentage: { avg: { field: "fgPercentage" } },
      },
    });

    // Elasticsearch Query for Season Averages (Filtering by Year)
    const seasonQuery = await client.search({
      index: "career-stats",
      size: 0,
      query: {
        bool: {
          must: [
            { term: { playerId } }, 
            { term: { opponentTeamId } }, 
            { range: { gameDate: { gte: "2024-10-01", lte: "2025-06-30" } } }, // Filter current season
          ],
        },
      },
      aggs: {
        avg_points: { avg: { field: "points" } },
        avg_rebounds: { avg: { field: "rebounds" } },
        avg_assists: { avg: { field: "assists" } },
        avg_steals: { avg: { field: "steals" } },
        avg_blocks: { avg: { field: "blocks" } },
        avg_fg_percentage: { avg: { field: "fgPercentage" } },
      },
    });

    return {
      playerId,
      opponentTeamId,
      historicalAverages: {
        points: historicalQuery.aggregations.avg_points.value || 0,
        rebounds: historicalQuery.aggregations.avg_rebounds.value || 0,
        assists: historicalQuery.aggregations.avg_assists.value || 0,
        steals: historicalQuery.aggregations.avg_steals.value || 0,
        blocks: historicalQuery.aggregations.avg_blocks.value || 0,
        fgPercentage: historicalQuery.aggregations.avg_fg_percentage.value || 0,
      },
      seasonAverages: {
        points: seasonQuery.aggregations.avg_points.value || 0,
        rebounds: seasonQuery.aggregations.avg_rebounds.value || 0,
        assists: seasonQuery.aggregations.avg_assists.value || 0,
        steals: seasonQuery.aggregations.avg_steals.value || 0,
        blocks: seasonQuery.aggregations.avg_blocks.value || 0,
        fgPercentage: seasonQuery.aggregations.avg_fg_percentage.value || 0,
      },
    };
  } catch (error) {
    console.error("Error querying Elasticsearch:", error);
    return { error: "Failed to retrieve data from Elasticsearch" };
  }
}


console.log(getAverages(237, 2))