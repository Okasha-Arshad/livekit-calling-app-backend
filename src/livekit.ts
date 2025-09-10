import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { config } from '@src/config';

export const roomService = new RoomServiceClient(
  config.livekit.restUrl,
  config.livekit.apiKey,
  config.livekit.apiSecret
);

// create a LiveKit JWT for a user
export function createAccessToken(roomName: string, userId: string, displayName?: string) {
  const at = new AccessToken(config.livekit.apiKey, config.livekit.apiSecret, {
    identity: userId,        // must be unique per user
    metadata: displayName ? JSON.stringify({ name: displayName }) : undefined,
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,     // you’ll publish only audio from app
    canSubscribe: true,
    // canPublishData: true, // enable if you want data channel
  });

  return at.toJwt();
}

// ensure room exists with capacity limit
export async function ensureRoom(roomName: string, maxParticipants = 4) {
  try {
    // idempotent: if exists, createRoom throws — we can ignore or pre-check via listRooms
    await roomService.createRoom({
      name: roomName,
      maxParticipants,
      emptyTimeout: 60 * 15, // auto-close after 15m idle
    });
  } catch (_) {
    // room probably exists, ignore
  }
}

// check current participant count
export async function isRoomFull(roomName: string, maxParticipants = 4, userId?: string) {
  const participants = await roomService.listParticipants(roomName);
  // allow reconnection for same identity
  const alreadyIn = userId ? participants.some(p => p.identity === userId) : false;
  return !alreadyIn && participants.length >= maxParticipants;
}
