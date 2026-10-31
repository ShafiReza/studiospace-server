import express from 'express';
import Studio from '../models/Studio.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/studios
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, search, location, minRate, maxRate, sort, limit } = req.query;
    const filter = { isAvailable: true };

    if (category && category !== 'All') {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { overview: { $regex: search, $options: 'i' } },
      ];
    }
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    if (minRate || maxRate) {
      filter.hourlyRate = {};
      if (minRate) filter.hourlyRate.$gte = Number(minRate);
      if (maxRate) filter.hourlyRate.$lte = Number(maxRate);
    }

    let query = Studio.find(filter);

    if (sort === 'price-asc') query = query.sort({ hourlyRate: 1 });
    else if (sort === 'price-desc') query = query.sort({ hourlyRate: -1 });
    else if (sort === 'rating') query = query.sort({ rating: -1 });
    else query = query.sort({ createdAt: -1 });

    if (limit) query = query.limit(Number(limit));

    const studios = await query.lean();
    res.json({ success: true, count: studios.length, studios });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch studios' });
  }
});

// GET /api/studios/featured
router.get('/featured', async (req, res) => {
  try {
    const studios = await Studio.find({ isAvailable: true })
      .sort({ rating: -1, createdAt: -1 })
      .limit(6)
      .lean();
    res.json({ success: true, studios });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch featured studios' });
  }
});

// GET /api/studios/my-listings
router.get('/my-listings', protect, async (req, res) => {
  try {
    const studios = await Studio.find({ hostEmail: req.user.email }).sort({ createdAt: -1 });
    res.json({ success: true, count: studios.length, studios });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch your listings' });
  }
});

// GET /api/studios/:id
router.get('/:id', async (req, res) => {
  try {
    const studio = await Studio.findById(req.params.id);
    if (!studio) {
      return res.status(404).json({ success: false, message: 'Studio not found' });
    }
    res.json({ success: true, studio });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch studio' });
  }
});

// POST /api/studios (Protected - JWT HTTPOnly)
router.post('/', protect, async (req, res) => {
  try {
    const {
      title,
      category,
      hourlyRate,
      securityDeposit,
      maxCapacity,
      location,
      address,
      image,
      images,
      amenities,
      overview,
    } = req.body;

    if (!title || !category || !hourlyRate || !maxCapacity || !location || !image || !overview) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const studio = await Studio.create({
      title,
      category,
      hourlyRate: Number(hourlyRate),
      securityDeposit: Number(securityDeposit) || 0,
      maxCapacity: Number(maxCapacity),
      location,
      address: address || location,
      image,
      images: images || [image],
      amenities: amenities || [],
      overview,
      hostEmail: req.user.email,
      hostName: req.user.name,
      hostId: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Studio listed successfully',
      studio,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create studio' });
  }
});

// PUT /api/studios/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const studio = await Studio.findById(req.params.id);
    if (!studio) {
      return res.status(404).json({ success: false, message: 'Studio not found' });
    }

    if (studio.hostEmail !== req.user.email && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this studio' });
    }

    const allowed = [
      'title', 'category', 'hourlyRate', 'securityDeposit', 'maxCapacity',
      'location', 'address', 'image', 'images', 'amenities', 'overview', 'isAvailable',
    ];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        studio[field] = req.body[field];
      }
    });

    await studio.save();
    res.json({ success: true, message: 'Studio updated successfully', studio });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update studio' });
  }
});

// DELETE /api/studios/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const studio = await Studio.findById(req.params.id);
    if (!studio) {
      return res.status(404).json({ success: false, message: 'Studio not found' });
    }

    if (studio.hostEmail !== req.user.email && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this studio' });
    }

    await studio.deleteOne();
    res.json({ success: true, message: 'Studio deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete studio' });
  }
});

export default router;
