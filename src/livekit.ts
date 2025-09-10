import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { config } from '@src/config';

export const roomService = new RoomServiceClient(
  config.livekit.restUrl,
  config.livekit.apiKey,
  config.livekit.apiSecret
);

// Global lobby room name for app-wide notifications
export const LOBBY_ROOM = 'app-lobby';

// create a LiveKit JWT for a user
export function createAccessToken(roomName: string, userId: string, displayName?: string) {
  const at = new AccessToken(config.livekit.apiKey, config.livekit.apiSecret, {
    identity: userId,        // must be unique per user
    metadata: displayName ? JSON.stringify({ name: displayName }) : undefined,
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,     // you'll publish only audio from app
    canSubscribe: true,
    canPublishData: true, // enable data channel for notifications
  });

  return at.toJwt();
}

// create access token specifically for the lobby room (notifications only)
export function createLobbyAccessToken(userId: string, displayName?: string) {
  const at = new AccessToken(config.livekit.apiKey, config.livekit.apiSecret, {
    identity: userId,
    metadata: displayName ? JSON.stringify({ name: displayName }) : undefined,
  });

  at.addGrant({
    roomJoin: true,
    room: LOBBY_ROOM,
    canPublish: false,    // no audio/video in lobby
    canSubscribe: false,  // no audio/video in lobby
    canPublishData: true, // can send data messages
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

// ensure the lobby room exists (unlimited participants)
export async function ensureLobbyRoom() {
  try {
    await roomService.createRoom({
      name: LOBBY_ROOM,
      maxParticipants: 1000, // large number for lobby
      emptyTimeout: 60 * 60 * 24, // 24 hours idle timeout
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

// send notification to all users in lobby about new session
export async function notifyNewSession(session: any) {
  try {
    // Update lobby room metadata with latest session info
    // This will trigger room events that connected clients can listen to
    const metadata = JSON.stringify({
      type: 'new_session',
      data: {
        sessionId: session.id,
        username: session.username,
        createdAt: session.created_at,
        timestamp: new Date().toISOString()
      }
    });

    await roomService.updateRoomMetadata(LOBBY_ROOM, metadata);
    console.log('📡 Updated lobby room metadata with new session:', session.username);
  } catch (error) {
    console.error('❌ Failed to update lobby room metadata:', error);
  }
}

// send notification to all users in lobby about deleted session
export async function notifySessionDeleted(session: any) {
  try {
    // Update lobby room metadata with session deletion info
    const metadata = JSON.stringify({
      type: 'session_deleted',
      data: {
        sessionId: session.id,
        username: session.username,
        createdAt: session.created_at,
        deletedAt: new Date().toISOString(),
        timestamp: new Date().toISOString()
      }
    });

    await roomService.updateRoomMetadata(LOBBY_ROOM, metadata);
    console.log('📡 Updated lobby room metadata - user left:', session.username);
  } catch (error) {
    console.error('❌ Failed to update lobby room metadata for deletion:', error);
  }
}
