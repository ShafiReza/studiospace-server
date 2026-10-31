
import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    studio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Studio',
      required: true,
    },
    studioTitle: String,
    studioImage: String,
    user: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    userName: String,
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    totalHours: {
      type: Number,
      required: true,
    },
    hourlyRate: Number,
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    notes: String,
  },
  { timestamps: true }
);

bookingSchema.index({ studio: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ userEmail: 1 });

export default mongoose.model('Booking', bookingSchema);
