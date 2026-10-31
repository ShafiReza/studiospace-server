import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth.js';
import { verifyAppJwt, signAppJwt, setJwtCookie } from '../utils/jwt.js';

/**
 * Challenge 1 — JWT in HTTPOnly cookies + Better Auth session
 *
 * Accepts either:
 * 1) App JWT from HTTPOnly cookie "token" (or Authorization: Bearer)
 * 2) Valid Better Auth session cookie
 *
 * On successful Better Auth session without JWT cookie, issues JWT automatically.
 * Unauthorized → 401
 */
export const protect = async (req, res, next) => {
  try {
    // --- 1) Try app JWT (HTTPOnly cookie or Bearer) ---
    let token = req.cookies?.token;
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = verifyAppJwt(token);
        req.user = {
          _id: decoded.id,
          id: decoded.id,
          name: decoded.name,
          email: decoded.email,
          photoURL: decoded.image || decoded.photoURL || null,
          role: decoded.role || 'user',
        };
        req.authMethod = 'jwt';
        return next();
      } catch {
        // fall through to Better Auth session
      }
    }

    // --- 2) Better Auth session ---
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please log in.',
      });
    }

    req.user = {
      _id: session.user.id,
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      photoURL: session.user.image || null,
      role: session.user.role || 'user',
    };
    req.session = session;
    req.authMethod = 'better-auth';

    // Issue app JWT in HTTPOnly cookie if missing (Challenge 1)
    if (!req.cookies?.token) {
      const appToken = signAppJwt({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: session.user.role || 'user',
      });
      setJwtCookie(res, appToken);
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token/session. Please log in again.',
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      try {
        const decoded = verifyAppJwt(token);
        req.user = {
          _id: decoded.id,
          id: decoded.id,
          name: decoded.name,
          email: decoded.email,
          photoURL: decoded.image || null,
          role: decoded.role || 'user',
        };
        return next();
      } catch {
        /* continue */
      }
    }

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (session?.user) {
      req.user = {
        _id: session.user.id,
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        photoURL: session.user.image || null,
        role: session.user.role || 'user',
      };
    }
    next();
  } catch {
    next();
  }
};
