import dotenv from 'dotenv';

dotenv.config({ path: `config/.env.${process.env.NODE_ENV}` });

function required(name: string, val?: string) {
  if (!val) throw new Error(`Missing env: ${name}`);
  return val;
}

const LIVEKIT_WS_URL = required('LIVEKIT_URL', process.env.LIVEKIT_URL);    // wss://...
// RoomServiceClient needs https://... (switch scheme)
const LIVEKIT_REST_URL = LIVEKIT_WS_URL.replace(/^wss:/, 'https:').replace(/^ws:/, 'http:');

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  livekit: {
    wsUrl: LIVEKIT_WS_URL,     // pass to client SDK
    restUrl: LIVEKIT_REST_URL, // pass to RoomServiceClient
    apiKey: required('LIVEKIT_API_KEY', process.env.LIVEKIT_API_KEY),
    apiSecret: required('LIVEKIT_API_SECRET', process.env.LIVEKIT_API_SECRET),
  },
};
