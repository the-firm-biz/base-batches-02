import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

/**
 * To resolve error:
 * "All attempts to open a WebSocket to connect to the database failed."
 * https://github.com/neondatabase/serverless/blob/main/CONFIG.md#websocketconstructor-typeof-websocket--undefined
 */
neonConfig.webSocketConstructor = ws;
