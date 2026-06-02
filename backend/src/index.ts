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

import registerRoutes from './routes/register';

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
const corsOptions = {
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
        // Allow requests with no origin (like mobile apps, curl, or server-to-server)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            'https://slyky-app.onrender.com',
            'http://localhost:5173',            
            'https://slyky.mehd.site',
            'https://www.slyky.mehd.site'
        ];

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn(`⚠️  CORS blocked origin: ${origin}`);
            callback(null, false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400   // 24 hours
};

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/v1/payments', paymentRoutes);
app.use('/v1/register', registerRoutes);

app.listen(PORT, () => {
  console.log(`Slyky backend running on port ${PORT}`);
});