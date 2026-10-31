import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth.js';
import connectDB from './config/db.js';
import studioRoutes from './routes/studioRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';

connectDB();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Better Auth MUST be before express.json()
// Match all paths under /api/auth (including nested: sign-in/social, callback/google, etc.)
app.all(/^\/api\/auth(\/.*)?$/, toNodeHandler(auth));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.json({
    message: 'StudioSpace API — Better Auth + JWT (HTTPOnly cookies)',
    version: '1.2.1',
    googleEnabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    auth: {
      betterAuth: '/api/auth/*',
      jwtSync: 'GET /api/session/sync',
      me: 'GET /api/session/me',
    },
  });
});

app.use('/api/session', sessionRoutes);
app.use('/api/studios', studioRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/wishlist', wishlistRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', path: req.originalUrl });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`StudioSpace API on :${PORT}`);
  console.log('Better Auth → /api/auth/* | JWT cookie → token (HTTPOnly)');
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.log('Google login: DISABLED (set GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET to enable)');
  } else {
    console.log('Google login: ENABLED');
  }
});
