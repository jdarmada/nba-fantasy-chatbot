import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import { fantasyAgent } from './agents/index';

export const mastra = new Mastra({
  agents: { 
    fantasyAgent 
  },
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
});