import { compareFantasyPlayers } from "@/lib/fantasyComp";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const fantasyComparisonTool = createTool({
    id: "Compare two NBA players",
    inputSchema: z.object({
        player1:z.string(),
        player2:z.string()
    }),
    description: "Compares the stats between two players",
    execute: async ({ context: { player1, player2 } }) => {
        console.log("Using tool to compare players", player1, player2);
        return await compareFantasyPlayers(player1, player2);
      },
})
    