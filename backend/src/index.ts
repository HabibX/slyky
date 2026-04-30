import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
dotenv.config();

import { railRegistry } from './core/railRegistry';
import { StellarXLMAdapter } from './adapters/stellar/StellarXLMAdapter';
import { StellarUSDCAdapter } from './adapters/stellar/StellarUSDCAdapter';
import { DetectionOrchestrator } from './services/detection';

// ---------- 1. Register adapters ----------
railRegistry.register(new StellarXLMAdapter());
railRegistry.register(new StellarUSDCAdapter());

// ---------- 2. Start detection ----------
const detector = new DetectionOrchestrator();
detector.start();

// ---------- 3. Express app ----------
const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Slyky backend running on port ${PORT}`);
});