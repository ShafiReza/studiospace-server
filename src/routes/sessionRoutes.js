import express from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth.js';
import { signAppJwt, setJwtCookie, clearJwtCookie } from '../utils/jwt.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * After Better Auth login, frontend can call this to ensure
 * app JWT is set in HTTPOnly cookie (Challenge 1).
 * GET /api/session/sync
 */
router.get('/sync', async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      clearJwtCookie(res);
      return res.status(401).json({ success: false, message: 'No active session' });
    }

    const token = signAppJwt({
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      role: session.user.role || 'user',
    });
    setJwtCookie(res, token);

    res.json({
      success: true,
      message: 'JWT cookie set',
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        photoURL: session.user.image || null,
      },
      // token also returned for optional Bearer use; primary storage is HTTPOnly cookie
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Clear app JWT cookie (call after Better Auth sign-out)
 * POST /api/session/logout
 */
router.post('/logout', (req, res) => {
  clearJwtCookie(res);
  res.json({ success: true, message: 'JWT cookie cleared' });
});

/**
 * Who am I — works with JWT cookie or Better Auth session
 * GET /api/session/me
 */
router.get('/me', protect, (req, res) => {
  res.json({
    success: true,
    authMethod: req.authMethod,
    user: req.user,
  });
});

export default router;
