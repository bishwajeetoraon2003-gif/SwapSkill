const express = require('express');
const store = require('../data/store');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  try {
    const userId = req.user.id;
    const user = store.findUserById(userId);
    const teachSkills = store.getUserTeachSkills(userId);
    const learnSkills = store.getUserLearnSkills(userId);

    const userSwaps = store.getSwapsForUser(userId).map(s => {
      const sender = store.findUserById(s.senderId);
      const receiver = store.findUserById(s.receiverId);
      return {
        ...s,
        sender: store.sanitizeUser(sender),
        receiver: store.sanitizeUser(receiver)
      };
    });

    const pendingIncoming = userSwaps.filter(s => s.receiverId === userId && s.status === 'pending');
    const pendingOutgoing = userSwaps.filter(s => s.senderId === userId && s.status === 'pending');
    const activeExchanges = userSwaps.filter(s => s.status === 'accepted');
    const completedExchanges = userSwaps.filter(s => s.status === 'completed');

    // Calculate total hours
    const hoursExchanged = user.hoursExchanged || (completedExchanges.length * 2);

    res.json({
      stats: {
        teachCount: teachSkills.length,
        learnCount: learnSkills.length,
        activeCount: activeExchanges.length,
        pendingIncomingCount: pendingIncoming.length,
        pendingOutgoingCount: pendingOutgoing.length,
        completedCount: completedExchanges.length,
        hoursExchanged,
        communityRating: user.rating || 5.0
      },
      pendingIncoming,
      activeExchanges,
      recentCompleted: completedExchanges.slice(0, 5),
      teachSkills,
      learnSkills
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard metrics' });
  }
});

module.exports = router;
