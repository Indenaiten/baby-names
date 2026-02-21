import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from '../infrastructure/database/connection';
import { seedRootUser } from './seed';
import userRoutes from './routes/userRoutes';
import groupRoutes from './routes/groupRoutes';
import nameRoutes from './routes/nameRoutes';

dotenv.config();

const app = express();
const PORT = process.env.BACKEND_PORT || 3000;

// Middleware
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api', nameRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
async function start() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/babynames';
  await connectDatabase(mongoUri);
  await seedRootUser();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
