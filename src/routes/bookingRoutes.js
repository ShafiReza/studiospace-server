import express from 'express';
import Booking from '../models/Booking.js';
import Studio from '../models/Studio.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Challenge 2: time overlap check
const hasOverlap = async (studioId, startTime, endTime, excludeBookingId = null) => {
  const filter = {
    studio: studioId,
    status: { $in: ['Pending', 'Confirmed'] },
    $or: [
      { startTime: { $lt: endTime, $gte: startTime } },
      { endTime: { $gt: startTime, $lte: endTime } },
      { startTime: { $lte: startTime }, endTime: { $gte: endTime } },
    ],
  };

  if (excludeBookingId) {
    filter._id = { $ne: excludeBookingId };
  }

  const conflicting = await Booking.findOne(filter);
  return !!conflicting;
};

// POST /api/bookings
router.post('/', protect, async (req, res) => {
  try {
    const { studioId, startTime, endTime, notes } = req.body;

    if (!studioId || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Studio, start time and end time are required',
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return res.status(400).json({
        success: false,
        message: 'Invalid start or end time',
      });
    }

    if (start < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book a time in the past',
      });
    }

    const studio = await Studio.findById(studioId);
    if (!studio || !studio.isAvailable) {
      return res.status(404).json({ success: false, message: 'Studio not available' });
    }

    const overlap = await hasOverlap(studioId, start, end);
    if (overlap) {
      return res.status(409).json({
        success: false,
        message: 'This time slot conflicts with an existing booking. Please choose another time.',
      });
    }

    const totalHours = (end - start) / (1000 * 60 * 60);
    const totalAmount = Math.round(totalHours * studio.hourlyRate * 100) / 100;

    const booking = await Booking.create({
      studio: studio._id,
      studioTitle: studio.title,
      studioImage: studio.image,
      user: req.user._id,
      userEmail: req.user.email,
      userName: req.user.name,
      startTime: start,
      endTime: end,
      totalHours: Math.round(totalHours * 100) / 100,
      hourlyRate: studio.hourlyRate,
      totalAmount,
      status: 'Pending',
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create booking' });
  }
});

// GET /api/bookings/my-bookings
router.get('/my-bookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ userEmail: req.user.email })
      .populate('studio', 'title image location category hourlyRate')
      .sort({ startTime: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
});

// GET /api/bookings/studio/:studioId
router.get('/studio/:studioId', protect, async (req, res) => {
  try {
    const studio = await Studio.findById(req.params.studioId);
    if (!studio) {
      return res.status(404).json({ success: false, message: 'Studio not found' });
    }
    if (studio.hostEmail !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const bookings = await Booking.find({
      studio: req.params.studioId,
      status: { $in: ['Pending', 'Confirmed'] },
    }).sort({ startTime: 1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch studio bookings' });
  }
});

// PATCH /api/bookings/:id/cancel
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.userEmail !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.status !== 'Pending' && booking.status !== 'Confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Only pending or confirmed bookings can be cancelled',
      });
    }

    booking.status = 'Cancelled';
    await booking.save();

    res.json({ success: true, message: 'Booking cancelled', booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to cancel booking' });
  }
});

// PATCH /api/bookings/:id/status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Confirmed', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const studio = await Studio.findById(booking.studio);
    if (!studio || studio.hostEmail !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Only the host can update status' });
    }

    booking.status = status;
    await booking.save();

    res.json({ success: true, message: `Booking ${status.toLowerCase()}`, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

export default router;
