import { Router } from 'express';
import { AccessToken } from 'livekit-server-sdk';
import { config } from '@src/config';

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
  

export default router;
