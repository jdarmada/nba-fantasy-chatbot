import { compareFantasyPlayers } from "@/lib/fantasyComp";

const fantasyComparisonTool = {
    name: 'compareFantasyPlayers',
    description: 'Compare two NBA players for fantasy basketball purposes',
    parameters: {
      type: 'object',
      properties: {
        player1: {
          type: 'string',
          description: 'The name of the first NBA player to compare',
        },
        player2: {
          type: 'string',
          description: 'The name of the second NBA player to compare',
        },
      },
      required: ['player1', 'player2'],
    },
    handler: async ({ player1, player2 }: { player1: string; player2: string }) => {
      try {
        const result = await compareFantasyPlayers(player1, player2);
        return result;
      } catch (error) {
        console.error('Error in fantasy comparison tool:', error);
        return { error: 'Failed to compare players. Please try again.' };
      }
    },
  };