import 'dotenv/config';
import mongoose from 'mongoose';
import Studio from './models/Studio.js';

/**
 * Seed sample studios.
 * Host email is set to host@studiospace.com — register that account
 * via Better Auth (or any account) and update hostEmail if needed.
 * For examiners: register host@studiospace.com / Password1 then run seed,
 * OR just use any registered account to add new studios.
 */
const studiosData = [
  {
    title: 'Lumina Photo Cyc Studio',
    category: 'Photo Studio',
    hourlyRate: 85,
    securityDeposit: 150,
    maxCapacity: 8,
    location: 'Downtown Arts District',
    address: '12 Creative Lane, Arts District',
    image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800',
    amenities: ['Cyc Wall', 'Softbox Kit', 'Backdrop System', 'Changing Room', 'WiFi'],
    overview: 'Professional cyclorama studio with seamless white walls, ideal for product photography, portraits, and fashion shoots.',
  },
  {
    title: 'Echo Chamber Sound Stage',
    category: 'Film Stage',
    hourlyRate: 220,
    securityDeposit: 500,
    maxCapacity: 25,
    location: 'Studio City',
    address: '450 Soundstage Blvd, Studio City',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800',
    amenities: ['Green Screen', 'Lighting Grid', 'Sound Isolation', 'Control Room', 'Parking'],
    overview: 'Full cinema sound stage with professional lighting grid and green screen wall.',
  },
  {
    title: 'Podcast Nest Lounge',
    category: 'Podcast Lounge',
    hourlyRate: 45,
    securityDeposit: 50,
    maxCapacity: 4,
    location: 'Midtown',
    address: '88 Broadcast Ave, Midtown',
    image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800',
    amenities: ['Rode Mics', 'Audio Interface', 'Acoustic Treatment', 'Video Camera', 'Coffee Bar'],
    overview: 'Cozy, acoustically treated podcast room with dual Rode microphones.',
  },
  {
    title: 'Harmony Music Suite',
    category: 'Music Suite',
    hourlyRate: 95,
    securityDeposit: 200,
    maxCapacity: 6,
    location: 'Westside',
    address: '210 Melody Road, Westside',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800',
    amenities: ['Grand Piano', 'Drum Kit', 'Guitar Amps', 'Vocal Booth', 'DAW Station'],
    overview: 'Fully equipped recording suite with vocal isolation booth and grand piano.',
  },
  {
    title: 'Canvas Collective Workshop',
    category: 'Art Workshop',
    hourlyRate: 35,
    securityDeposit: 40,
    maxCapacity: 12,
    location: 'East End',
    address: '5 Gallery Street, East End',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800',
    amenities: ['Easels', 'Sink Station', 'Natural Light', 'Storage Lockers', 'Projector'],
    overview: 'Bright art workshop with north-facing windows and wash stations.',
  },
  {
    title: 'Noir Blackout Stage',
    category: 'Sound Stage',
    hourlyRate: 175,
    securityDeposit: 300,
    maxCapacity: 15,
    location: 'Industrial Park',
    address: '77 Warehouse Way, Industrial Park',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
    amenities: ['Full Blackout', 'Truss System', 'Power Distribution', 'Makeup Station', 'Loading Dock'],
    overview: 'Large blackout stage with heavy-duty truss and high power capacity.',
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studiospace');
    console.log('Connected to MongoDB');

    await Studio.deleteMany({});

    // Placeholder host — after you register via Better Auth, re-seed or update hostEmail
    const hostEmail = 'host@studiospace.com';
    const hostName = 'Alex Rivera';
    // ObjectId-like placeholder (studios need hostId; use a fixed string id for demo)
    const hostId = "seed-host-placeholder";

    for (const data of studiosData) {
      await Studio.create({
        ...data,
        hostEmail,
        hostName,
        hostId,
        rating: 4.2 + Math.random() * 0.7,
        reviewCount: Math.floor(Math.random() * 40) + 5,
      });
    }

    console.log(`Seeded ${studiosData.length} studios (hostEmail: ${hostEmail})`);
    console.log('Register at frontend with host@studiospace.com / Password1 to manage listings');
    console.log('Or register any account and use Add Studio to create your own.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
