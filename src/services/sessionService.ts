import db from '../config/database';
import { uniqueNamesGenerator, names } from 'unique-names-generator';
import { notifyNewSession, notifySessionDeleted } from '../livekit';

function generateHumanName(): string {
  return uniqueNamesGenerator({
    dictionaries: [names],   // only human names
    style: 'capital',        // Capitalize first letter
  });
}

export async function createSession() {
  const username = generateHumanName();
  const result = await db.query(
    'INSERT INTO sessions (username, created_at) VALUES ($1, NOW()) RETURNING id, username, created_at',
    [username]
  );
  
  const session = result.rows[0];
  
  // Notify all users in the lobby about the new session
  await notifyNewSession(session);
  
  return session;
}

export async function listSessions() {
  const result = await db.query(
    'SELECT id, username, created_at FROM sessions ORDER BY created_at DESC'
  );
  return result.rows;
}

export async function deleteSession(sessionId: string) {
  // First get the session details before deleting
  const getSessionResult = await db.query(
    'SELECT id, username, created_at FROM sessions WHERE id = $1',
    [sessionId]
  );
  
  if (getSessionResult.rows.length === 0) {
    throw new Error('Session not found');
  }
  
  const session = getSessionResult.rows[0];
  
  // Delete the session
  const result = await db.query(
    'DELETE FROM sessions WHERE id = $1 RETURNING id, username, created_at',
    [sessionId]
  );
  
  const deletedSession = result.rows[0];
  
  // Notify all users in the lobby about the deleted session
  await notifySessionDeleted(deletedSession);
  
  return deletedSession;
}