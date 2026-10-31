
import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { jwt } from 'better-auth/plugins';
import { MongoClient } from 'mongodb';

const mongoUri =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studiospace';

const client = new MongoClient(mongoUri);
await client.connect();

const db = client.db();

// Normalize URLs (remove trailing slashes)
const normalizeUrl = (url) => url?.trim().replace(/\/+$/, '');

const CLIENT_URL = normalizeUrl(
  process.env.CLIENT_URL || 'http://localhost:3000'
);

const BETTER_AUTH_URL = normalizeUrl(
  process.env.BETTER_AUTH_URL || 'http://localhost:5000'
);

export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),

  secret: process.env.BETTER_AUTH_SECRET,

  baseURL: BETTER_AUTH_URL,

  trustedOrigins: [
    CLIENT_URL,
    'http://localhost:3000',
  ],

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },

  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
      strategy: 'jwt',
    },
  },

  plugins: [
    jwt({
      sessionCookieCache: true,
    }),
  ],
});

export { client, db };
