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
import paymentRoutes from './routes/payments';

// Register adapters
railRegistry.register(new StellarXLMAdapter());
railRegistry.register(new StellarUSDCAdapter());

// Start detection
const detector = new DetectionOrchestrator();
detector.start();

// Express app
const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/v1/payments', paymentRoutes);

app.listen(PORT, () => {
  console.log(`Slyky backend running on port ${PORT}`);
});