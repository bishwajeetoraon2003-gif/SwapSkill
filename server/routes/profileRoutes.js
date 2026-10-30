const express = require('express');
const store = require('../data/store');
const { requireAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/:id - Public profile of any member
router.get('/:id', optionalAuth, (req, res) => {
  const user = store.findUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const teachSkills = store.getUserTeachSkills(user.id);
  const learnSkills = store.getUserLearnSkills(user.id);
  
  // Completed swaps with reviews
  const completedSwaps = store.swaps.filter(
    s => (s.receiverId === user.id || s.senderId === user.id) && s.status === 'completed' && s.review
  ).map(s => {
    const reviewer = store.findUserById(s.senderId === user.id ? s.receiverId : s.senderId);
    return {
      id: s.id,
      reviewerName: reviewer ? reviewer.name : 'SkillSwap Member',
      reviewerAvatar: reviewer ? reviewer.avatar : '',
      rating: s.rating,
      review: s.review,
      skillsExchanged: `${s.offeredSkill} ⇄ ${s.requestedSkill}`,
      date: s.completedAt
    };
  });

  res.json({
    user: store.sanitizeUser(user),
    teachSkills,
    learnSkills,
    reviews: completedSwaps
  });
});

// PUT /api/users/profile - Update own profile
router.put('/profile', requireAuth, (req, res) => {
  try {
    const { name, title, bio, location, timezone, avatar } = req.body;
    const updated = store.updateUser(req.user.id, {
      name,
      title,
      bio,
      location,
      timezone,
      avatar
    });

    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: store.sanitizeUser(updated)
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
