import mongoose from 'mongoose';

const studioSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Photo Studio',
        'Film Stage',
        'Podcast Lounge',
        'Music Suite',
        'Art Workshop',
        'Sound Stage',
        'Other',
      ],
    },
    hourlyRate: {
      type: Number,
      required: [true, 'Hourly rate is required'],
      min: 0,
    },
    securityDeposit: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxCapacity: {
      type: Number,
      required: true,
      min: 1,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    address: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
    },
    images: {
      type: [String],
      default: [],
    },
    amenities: {
      type: [String],
      default: [],
    },
    overview: {
      type: String,
      required: [true, 'Overview is required'],
    },
    hostEmail: {
      type: String,
      required: true,
    },
    hostName: {
      type: String,
      required: true,
    },
    // Better Auth user ids are strings
    hostId: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

studioSchema.index({ category: 1, location: 1 });
studioSchema.index({ hostEmail: 1 });

export default mongoose.model('Studio', studioSchema);
