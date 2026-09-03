import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import { seedDatabase } from './seed.js';
import { errorHandler } from './middleware/errorHandler.js';
import { SocketService } from './services/socketService.js';
import { SchedulerService } from './services/schedulerService.js';

import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import regionRoutes from './routes/regionRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
import mealPlanRoutes from './routes/mealPlanRoutes.js';
import mealLogRoutes from './routes/mealLogRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import snapCheckRoutes from './routes/snapCheckRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import trainerRoutes from './routes/trainerRoutes.js';
import exerciseRoutes from './routes/exerciseRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import foodLogRoutes from './routes/foodLogRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
app.use(helmet({ contentSecurityPolicy: false }));

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes('*') || allowedOrigins.some((o) => origin.startsWith(o))) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'HEALTHY',
    service: 'Regional AI Diet & Fitness API',
    timestamp: new Date().toISOString(),
  });
});

// Swagger Documentation OpenAPI Endpoint
app.get('/api-docs', (req: Request, res: Response) => {
  res.send(`
    <!Platform html>
    <html>
      <head>
        <title>Regional AI Diet & Fitness API Documentation</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui.css" />
        <style>body { margin: 0; padding: 0; background: #fafafa; }</style>
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-bundle.js"></script>
        <script>
          const spec = {
            "openapi": "3.0.0",
            "info": {
              "title": "Regional AI Diet & Fitness Assistant API",
              "version": "1.0.0",
              "description": "Production REST API for personalized nutrition target calculation, region-aware food candidate scoring, automated 5-slot meal plan generation, meal logging, progress tracking, and recommendation feedback loops."
            },
            "servers": [{ "url": "http://localhost:5000/api" }],
            "paths": {
              "/auth/register": { "post": { "summary": "Register a new user account" } },
              "/auth/login": { "post": { "summary": "Authenticate user & issue JWT token" } },
              "/profile": { "get": { "summary": "Get user fitness profile & target macros" }, "put": { "summary": "Update profile & recalculate targets" } },
              "/regions": { "get": { "summary": "List available regional food hubs" } },
              "/foods": { "get": { "summary": "Search & filter regional foods database" } },
              "/meal-plans/generate": { "post": { "summary": "Generate personalized 5-slot meal plan" } },
              "/meal-plans/today": { "get": { "summary": "Fetch today's active meal plan" } },
              "/meal-logs": { "post": { "summary": "Log consumed meal item" }, "get": { "summary": "Get daily logged meals summary" } },
              "/recommendations": { "get": { "summary": "Fetch candidate recommendations with explanation reasons" } },
              "/recommendations/feedback": { "post": { "summary": "Submit like/dislike/consumed feedback for AI engine learning" } },
              "/progress/analytics": { "get": { "summary": "Fetch weight trend, calories, and protein charts" } },
              "/admin/dashboard": { "get": { "summary": "Fetch admin dashboard KPI metrics & growth analytics" } }
            }
          };
          SwaggerUIBundle({ spec, dom_id: '#swagger-ui' });
        </script>
      </body>
    </html>
  `);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/regions', regionRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/meal-plans', mealPlanRoutes);
app.use('/api/meal-logs', mealLogRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/snap-check', snapCheckRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/health-metrics', healthRoutes);
app.use('/api/food-log', foodLogRoutes);
app.use('/api/recipes', recipeRoutes);

// Error Handler
app.use(errorHandler);

// HTTP Server Wrap & Socket.IO Attachment
const server = http.createServer(app);

// Start Server & Connect Database
const startServer = async () => {
  await connectDB();
  await seedDatabase();

  // Initialize Socket.IO Gateway
  SocketService.init(server);

  // Initialize Scheduler Cron Jobs
  SchedulerService.init();

  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`  Regional AI Diet & Fitness API Server running on port ${PORT}`);
    console.log(`  Real-Time Socket.IO: Active on ws://localhost:${PORT}/socket.io`);
    console.log(`  LAN Host Access: http://0.0.0.0:${PORT}`);
    console.log(`  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`  Swagger API Docs: http://localhost:${PORT}/api-docs`);
    console.log(`=======================================================`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
