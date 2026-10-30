const express = require('express');
const store = require('../data/store');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function enrichSwap(swap) {
  const sender = store.findUserById(swap.senderId);
  const receiver = store.findUserById(swap.receiverId);
  return {
    ...swap,
    sender: store.sanitizeUser(sender),
    receiver: store.sanitizeUser(receiver)
  };
}

// GET /api/swaps - Categorized swaps for current user
router.get('/', requireAuth, (req, res) => {
  try {
    const userId = req.user.id;
    const userSwaps = store.getSwapsForUser(userId).map(enrichSwap);

    const incomingPending = userSwaps.filter(s => s.receiverId === userId && s.status === 'pending');
    const outgoingPending = userSwaps.filter(s => s.senderId === userId && s.status === 'pending');
    const active = userSwaps.filter(s => s.status === 'accepted');
    const completed = userSwaps.filter(s => s.status === 'completed');
    const past = userSwaps.filter(s => s.status === 'rejected' || s.status === 'cancelled');

    res.json({
      summary: {
        total: userSwaps.length,
        incomingCount: incomingPending.length,
        outgoingCount: outgoingPending.length,
        activeCount: active.length,
        completedCount: completed.length
      },
      incomingPending,
      outgoingPending,
      active,
      completed,
      past
    });
  } catch (err) {
    console.error('Get swaps error:', err);
    res.status(500).json({ error: 'Failed to fetch swap requests' });
  }
});

// POST /api/swaps - Send a new swap request
router.post('/', requireAuth, (req, res) => {
  try {
    const { receiverId, offeredSkill, requestedSkill, message, format, preferredTime } = req.body;

    if (!receiverId) {
      return res.status(400).json({ error: 'Receiver user ID is required' });
    }
    if (receiverId === req.user.id) {
      return res.status(400).json({ error: 'You cannot request a skill swap with yourself' });
    }
    if (!offeredSkill || !offeredSkill.trim()) {
      return res.status(400).json({ error: 'Please specify the skill you are offering to teach' });
    }
    if (!requestedSkill || !requestedSkill.trim()) {
      return res.status(400).json({ error: 'Please specify the skill you want to learn' });
    }

    const receiver = store.findUserById(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: 'Target user does not exist' });
    }

    // Check if there is already a pending swap between these two users
    const existing = store.swaps.find(
      s => ((s.senderId === req.user.id && s.receiverId === receiverId) ||
            (s.senderId === receiverId && s.receiverId === req.user.id)) &&
           (s.status === 'pending' || s.status === 'accepted')
    );

    if (existing) {
      return res.status(400).json({
        error: `There is already an active or pending swap request with ${receiver.name}. Please check your Learning Dashboard.`
      });
    }

    const swap = store.createSwapRequest(req.user.id, {
      receiverId,
      offeredSkill: offeredSkill.trim(),
      requestedSkill: requestedSkill.trim(),
      message: message ? message.trim() : `Hi ${receiver.name}, I would love to exchange skills with you!`,
      format: format || '1-on-1 Video Call',
      preferredTime: preferredTime ? preferredTime.trim() : 'Flexible'
    });

    res.status(201).json({
      message: `Swap request successfully sent to ${receiver.name}!`,
      swap: enrichSwap(swap)
    });
  } catch (err) {
    console.error('Create swap error:', err);
    res.status(500).json({ error: 'Failed to send swap request' });
  }
});

// PUT /api/swaps/:id/status - Accept, Reject, Cancel, or Complete
router.put('/:id/status', requireAuth, (req, res) => {
  try {
    const { status, rating, review, notes } = req.body;
    const validStatuses = ['accepted', 'rejected', 'cancelled', 'completed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid swap status' });
    }

    const updated = store.updateSwapStatus(req.params.id, req.user.id, status, {
      rating,
      review,
      notes
    });

    if (!updated) {
      return res.status(404).json({ error: 'Swap request not found' });
    }

    let statusMsg = 'Swap updated';
    if (status === 'accepted') statusMsg = 'Swap request accepted! You can now coordinate sessions.';
    if (status === 'rejected') statusMsg = 'Swap request declined.';
    if (status === 'completed') statusMsg = 'Exchange marked as completed! Thank you for sharing knowledge.';
    if (status === 'cancelled') statusMsg = 'Swap request cancelled.';

    res.json({
      message: statusMsg,
      swap: enrichSwap(updated)
    });
  } catch (err) {
    console.error('Update swap status error:', err);
    res.status(400).json({ error: err.message || 'Failed to update swap status' });
  }
});

// PUT /api/swaps/:id/notes - Update coordination session notes
router.put('/:id/notes', requireAuth, (req, res) => {
  try {
    const swap = store.getSwapById(req.params.id);
    if (!swap) {
      return res.status(404).json({ error: 'Swap not found' });
    }
    if (swap.senderId !== req.user.id && swap.receiverId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    swap.notes = (req.body.notes || '').trim();
    store.save();

    res.json({
      message: 'Session notes saved',
      swap: enrichSwap(swap)
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save session notes' });
  }
});

module.exports = router;
