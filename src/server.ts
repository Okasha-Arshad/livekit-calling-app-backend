import express from 'express';
import cors from 'cors';
import { config } from '@src/config';
import roomsRouter from './routes';
import { errorHandler } from './middleware/error';

const app = express();

app.use(express.json());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // allow non-browser clients (curl)
    if (config.cors.origins.length === 0 || config.cors.origins.includes(origin)) {
      return cb(null, true);
    }
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/v1', roomsRouter);

// error handler last
app.use(errorHandler);

app.listen(config.port, "0.0.0.0", () => {
  console.log(`➡️  API running on http://localhost:${config.port} (${config.env})`);
});
