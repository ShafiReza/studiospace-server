import express from 'express';
import Wishlist from '../models/Wishlist.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const items = await Wishlist.find({ userEmail: req.user.email })
      .populate('studio')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: items.length, items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch wishlist' });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { studioId } = req.body;
    if (!studioId) {
      return res.status(400).json({ success: false, message: 'Studio ID required' });
    }

    const existing = await Wishlist.findOne({
      user: req.user._id,
      studio: studioId,
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already in wishlist' });
    }

    const item = await Wishlist.create({
      user: req.user._id,
      userEmail: req.user.email,
      studio: studioId,
    });

    res.status(201).json({ success: true, message: 'Added to wishlist', item });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Already in wishlist' });
    }
    res.status(500).json({ success: false, message: 'Failed to add to wishlist' });
  }
});

router.delete('/:studioId', protect, async (req, res) => {
  try {
    const result = await Wishlist.findOneAndDelete({
      user: req.user._id,
      studio: req.params.studioId,
    });
    if (!result) {
      return res.status(404).json({ success: false, message: 'Not found in wishlist' });
    }
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove from wishlist' });
  }
});

export default router;
