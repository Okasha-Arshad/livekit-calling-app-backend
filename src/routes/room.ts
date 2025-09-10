import { Router } from 'express';
import { z } from 'zod';
import { config } from '@src/config';
import { createAccessToken, ensureRoom, isRoomFull, roomService } from '../livekit';

const router = Router();

// For prototype: define your 3 rooms
const ROOM_CATALOG = [
  { id: 'room-1', name: 'Room 1' },
  { id: 'room-2', name: 'Room 2' },
  { id: 'room-3', name: 'Room 3' },
];

// GET /v1/rooms – list rooms and (optionally) current participant counts
router.get('/rooms', async (_req, res) => {
  const data = await Promise.all(ROOM_CATALOG.map(async (r) => {
    try {
      const participants = await roomService.listParticipants(r.id);
      return { ...r, participants: participants.map(p => ({ id: p.identity })) };
    } catch {
      // if room does not exist yet
      return { ...r, participants: [] };
    }
  }));
  res.json({ rooms: data });
});

const JoinSchema = z.object({
  roomName: z.string().min(1),
  userId: z.string().min(1),
  displayName: z.string().optional(),
});

// POST /v1/livekit/join – returns token + ws url
router.post('/livekit/join', async (req, res, next) => {
  try {
    const { roomName, userId, displayName } = JoinSchema.parse(req.body);

    // optional: only allow our 3 rooms
    if (!ROOM_CATALOG.some(r => r.id === roomName)) {
      return res.status(404).json({ error: 'Room not found' });
    }

    await ensureRoom(roomName, 4);

    if (await isRoomFull(roomName, 4, userId)) {
      return res.status(409).json({ error: 'Room is full (max 4 participants)' });
    }

    const token = await createAccessToken(roomName, userId, displayName);
    return res.json({ token, url: config.livekit.wsUrl });
  } catch (err) {
    next(err);
  }
});

export default router;
