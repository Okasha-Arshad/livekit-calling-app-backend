import { Router } from 'express';
import { AccessToken } from 'livekit-server-sdk';
import { config } from '@src/config';
import { createLobbyAccessToken, ensureLobbyRoom, LOBBY_ROOM } from '@src/livekit';

const router = Router();

/**
 * Join a room and return an access token
 */
router.post('/join', async (req, res) => {
    const { roomName, userId, displayName } = req.body;
  
    if (!roomName || !userId) {
      return res.status(400).json({ error: 'roomName and userId are required' });
    }
  
    try {
      const at = new AccessToken(config.livekit.apiKey, config.livekit.apiSecret, {
        identity: userId,
        name: displayName || userId,
      });
  
      at.addGrant({
        room: roomName,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
      });
  
      const token = await at.toJwt(); // 👈 await here
  
      console.log("Generated JWT:", token);
  
      res.json({
        url: config.livekit.wsUrl,
        token,
      });
    } catch (err) {
      console.error('Failed to create token:', err);
      res.status(500).json({ error: 'Failed to create token' });
    }
  });

/**
 * Join the app lobby to receive real-time notifications
 */
router.post('/lobby/join', async (req, res) => {
  const { userId, displayName } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    // Ensure lobby room exists
    await ensureLobbyRoom();

    // Create lobby access token
    const token = await createLobbyAccessToken(userId, displayName);

    console.log('🏛️ Generated lobby token for user:', userId);

    res.json({
      url: config.livekit.wsUrl,
      token,
      roomName: LOBBY_ROOM,
      message: 'Connect to this room to receive real-time app notifications'
    });
  } catch (err) {
    console.error('Failed to create lobby token:', err);
    res.status(500).json({ error: 'Failed to create lobby token' });
  }
});
  

export default router;
