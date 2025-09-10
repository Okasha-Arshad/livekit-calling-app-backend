import express from 'express';
import cors from 'cors';
import { config } from '@src/config';
import roomsRouter from './routes';
import { errorHandler } from './middleware/error';
import { initDb } from './config/database';
import { ensureLobbyRoom } from './livekit';

const app = express();

app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true,
}));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/v1', roomsRouter);

// error handler last
app.use(errorHandler);

(async () => {
  try {
    console.log('🗄️  Initializing database...');
    await initDb();
    
    console.log('🏛️  Initializing lobby room...');
    await ensureLobbyRoom();
    
    console.log('✅ Initialization complete');
  } catch (err) {
    console.error('❌ Failed to initialize:', (err as Error).message);
    process.exit(1);
  }

  app.listen(config.port, "0.0.0.0", () => {
    console.log(`➡️  API running on http://192.168.1.28:${config.port} (${config.env})`);
    console.log(`🏛️  Lobby notifications available at: /v1/livekit/lobby/join`);
  });
})();
