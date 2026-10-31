import jwt from 'jsonwebtoken';

/**
 * App-level JWT (Challenge 1)
 * Stored in HTTPOnly cookie named "token"
 * Used to protect POST/DELETE mutations alongside Better Auth session
 */
const secret = () =>
  process.env.JWT_SECRET || process.env.BETTER_AUTH_SECRET || 'dev_fallback_secret_change_me';

export const signAppJwt = (payload) => {
  return jwt.sign(payload, secret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export const verifyAppJwt = (token) => {
  return jwt.verify(token, secret());
};

export const setJwtCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true, // Challenge 1: HTTPOnly
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
};

export const clearJwtCookie = (res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
};
