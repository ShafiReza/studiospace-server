import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    studio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Studio',
      required: true,
    },
  },
  { timestamps: true }
);

wishlistSchema.index({ user: 1, studio: 1 }, { unique: true });

export default mongoose.model('Wishlist', wishlistSchema);
