import { compareFantasyPlayers } from "@/lib/fantasyComp";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const fantasyComparisonTool = createTool({
    id: "Compare two NBA players",
    inputSchema: z.object({
        player1:z.string(),
        player2:z.string()
    }),
    description: "Use this tool to get the upcoming matchup for each player in the user query, then compare their historical and season averages",
    execute: async ({ context: { player1, player2 } }) => {
        return await compareFantasyPlayers(player1, player2);
      },
})
    