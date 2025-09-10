import { createSession, deleteSession, listSessions } from '@src/services/sessionService';
import { Router } from 'express';
const router = Router();
// POST /sessions → create new session
router.post('/', async (req, res) => {
  console.log(':memo: POST /sessions - Creating new session');
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);
  try {
    const session = await createSession();
    console.log(':white_check_mark: Session created successfully:');
    console.log('Session ID:', session.id);
    console.log('Username:', session.username);
    console.log('Created at:', session.created_at);
    console.log('Full session object:', JSON.stringify(session, null, 2));
    res.json(session);
  } catch (err) {
    console.error(':x: Failed to create session:', err);
    res.status(500).json({ error: 'Failed to create session' });
  }
});
// GET /sessions → list all sessions
router.get('/', async (_req, res) => {
  console.log(':clipboard: GET /sessions - Fetching all sessions');
  try {
    const sessions = await listSessions();
    console.log(':white_check_mark: Sessions fetched successfully:');
    console.log('Total sessions:', sessions.length);
    console.log('Sessions:', JSON.stringify(sessions, null, 2));
    res.json(sessions);
  } catch (err) {
    console.error(':x: Failed to fetch sessions:', err);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});
// DELETE /sessions/:id → delete specific session
router.delete('/:id', async (req, res) => {
  const sessionId = req.params.id; // Keep as string since it's a UUID
  console.log('🗑️ DELETE /sessions - Deleting session:', sessionId);
  try {
    const deletedSession = await deleteSession(sessionId);
    console.log('✅ Session deleted successfully:');
    console.log('🔔 Real-time notification sent to lobby users - user left');
    console.log('Deleted session:', JSON.stringify(deletedSession, null, 2));
    res.json({ message: 'Session deleted successfully', session: deletedSession });
  } catch (err) {
    console.error('❌ Failed to delete session:', err);
    if ((err as Error).message === 'Session not found') {
      res.status(404).json({ error: 'Session not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete session' });
    }
  }
});
export default router;