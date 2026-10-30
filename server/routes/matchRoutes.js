const express = require('express');
const store = require('../data/store');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function normalize(str) {
  return (str || '').toLowerCase().trim();
}

function skillsMatch(skillA, skillB) {
  const a = normalize(skillA);
  const b = normalize(skillB);
  return a.includes(b) || b.includes(a);
}

// GET /api/matches - Smart Matching for the logged-in user
router.get('/', requireAuth, (req, res) => {
  try {
    const currentUserId = req.user.id;
    const currentUserTeach = store.getUserTeachSkills(currentUserId);
    const currentUserLearn = store.getUserLearnSkills(currentUserId);

    if (currentUserTeach.length === 0 && currentUserLearn.length === 0) {
      return res.json({
        reciprocalMatches: [],
        highPotentialMatches: [],
        stats: {
          reciprocalCount: 0,
          potentialCount: 0
        },
        message: 'Add skills you can teach and want to learn to unlock smart matching recommendations!'
      });
    }

    const reciprocal = [];
    const highPotential = [];

    for (const otherUser of store.users) {
      if (otherUser.id === currentUserId) continue;

      const otherTeach = store.getUserTeachSkills(otherUser.id);
      const otherLearn = store.getUserLearnSkills(otherUser.id);

      // 1. What current user can teach to other user
      const canTeachThem = [];
      for (const myTeach of currentUserTeach) {
        for (const theirLearn of otherLearn) {
          if (skillsMatch(myTeach.title, theirLearn.title)) {
            canTeachThem.push({
              offered: myTeach.title,
              theirGoal: theirLearn.targetGoal,
              proficiency: myTeach.proficiency
            });
          }
        }
      }

      // 2. What other user can teach to current user
      const canLearnFrom = [];
      for (const theirTeach of otherTeach) {
        for (const myLearn of currentUserLearn) {
          if (skillsMatch(theirTeach.title, myLearn.title)) {
            canLearnFrom.push({
              requested: theirTeach.title,
              theirProficiency: theirTeach.proficiency,
              myGoal: myLearn.targetGoal
            });
          }
        }
      }

      // Check for mutual exchange
      if (canTeachThem.length > 0 && canLearnFrom.length > 0) {
        const score = Math.min(100, 90 + (canTeachThem.length + canLearnFrom.length) * 5);
        reciprocal.push({
          user: store.sanitizeUser(otherUser),
          matchType: 'mutual_reciprocal',
          score,
          title: 'Perfect 1:1 Mutual Match',
          reason: `You can teach ${canTeachThem.map(c => c.offered).join(', ')} while ${otherUser.name} teaches ${canLearnFrom.map(c => c.requested).join(', ')}.`,
          canTeachThem,
          canLearnFrom,
          suggestedOffer: canTeachThem[0]?.offered,
          suggestedRequest: canLearnFrom[0]?.requested
        });
      } else if (canLearnFrom.length > 0) {
        // They have something you want!
        const score = Math.min(85, 70 + canLearnFrom.length * 5);
        highPotential.push({
          user: store.sanitizeUser(otherUser),
          matchType: 'can_teach_you',
          score,
          title: 'Skill Mentor Match',
          reason: `${otherUser.name} teaches ${canLearnFrom.map(c => c.requested).join(', ')} which is on your wishlist!`,
          canTeachThem: [],
          canLearnFrom,
          suggestedOffer: currentUserTeach[0]?.title || '',
          suggestedRequest: canLearnFrom[0]?.requested
        });
      } else if (canTeachThem.length > 0) {
        // They want something you have!
        const score = Math.min(80, 60 + canTeachThem.length * 5);
        highPotential.push({
          user: store.sanitizeUser(otherUser),
          matchType: 'wants_your_skill',
          score,
          title: 'Learning Partner Match',
          reason: `${otherUser.name} is looking for someone to teach ${canTeachThem.map(c => c.offered).join(', ')}!`,
          canTeachThem,
          canLearnFrom: [],
          suggestedOffer: canTeachThem[0]?.offered,
          suggestedRequest: otherTeach[0]?.title || ''
        });
      }
    }

    // Sort by score descending
    reciprocal.sort((a, b) => b.score - a.score);
    highPotential.sort((a, b) => b.score - a.score);

    res.json({
      reciprocalMatches: reciprocal,
      highPotentialMatches: highPotential,
      stats: {
        reciprocalCount: reciprocal.length,
        potentialCount: highPotential.length
      }
    });
  } catch (err) {
    console.error('Smart match error:', err);
    res.status(500).json({ error: 'Failed to calculate smart matches' });
  }
});

module.exports = router;
