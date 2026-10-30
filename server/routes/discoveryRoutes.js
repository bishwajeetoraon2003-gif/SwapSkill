const express = require('express');
const store = require('../data/store');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Helper to normalize strings for comparison
function normalize(str) {
  return (str || '').toLowerCase().trim();
}

function skillsMatch(skillA, skillB) {
  const a = normalize(skillA);
  const b = normalize(skillB);
  return a.includes(b) || b.includes(a);
}

// GET /api/discovery
router.get('/', optionalAuth, (req, res) => {
  try {
    const { query, category, type, proficiency } = req.query;
    const currentUserId = req.user ? req.user.id : null;

    let currentUserTeach = [];
    let currentUserLearn = [];
    if (currentUserId) {
      currentUserTeach = store.getUserTeachSkills(currentUserId);
      currentUserLearn = store.getUserLearnSkills(currentUserId);
    }

    // Build user profiles with their teach and learn skills
    const results = [];

    for (const user of store.users) {
      // Don't show current logged-in user in discovery as a swap partner for themselves
      if (currentUserId && user.id === currentUserId) continue;

      const teachSkills = store.getUserTeachSkills(user.id);
      const learnSkills = store.getUserLearnSkills(user.id);

      // Filter by category if requested
      if (category && category !== 'All') {
        const hasTeachCat = teachSkills.some(s => s.category.toLowerCase() === category.toLowerCase());
        const hasLearnCat = learnSkills.some(s => s.category.toLowerCase() === category.toLowerCase());
        if (!hasTeachCat && !hasLearnCat) continue;
      }

      // Filter by proficiency if requested
      if (proficiency && proficiency !== 'All') {
        const hasProf = teachSkills.some(s => s.proficiency.toLowerCase() === proficiency.toLowerCase());
        if (!hasProf) continue;
      }

      // Filter by text query if requested
      if (query && query.trim()) {
        const q = normalize(query);
        const nameMatch = normalize(user.name).includes(q);
        const titleMatch = normalize(user.title).includes(q);
        const bioMatch = normalize(user.bio).includes(q);
        const locationMatch = normalize(user.location).includes(q);
        const teachMatch = teachSkills.some(s => normalize(s.title).includes(q) || normalize(s.description).includes(q));
        const learnMatch = learnSkills.some(s => normalize(s.title).includes(q) || normalize(s.targetGoal).includes(q));

        if (!nameMatch && !titleMatch && !bioMatch && !locationMatch && !teachMatch && !learnMatch) {
          continue;
        }
      }

      // Filter by type: 'teach' means looking for people who teach something, 'learn' means looking for people who want to learn
      if (type === 'teach' && teachSkills.length === 0) continue;
      if (type === 'learn' && learnSkills.length === 0) continue;

      // Calculate compatibility if user is logged in
      let matchScore = 0;
      let reciprocalMatch = false;
      let matchedTeachToLearn = [];
      let matchedLearnFromTeach = [];

      if (currentUserId) {
        // Can current user teach what this user wants?
        matchedTeachToLearn = currentUserTeach.filter(myTeach =>
          learnSkills.some(theirLearn => skillsMatch(myTeach.title, theirLearn.title))
        );

        // Can this user teach what current user wants?
        matchedLearnFromTeach = teachSkills.filter(theirTeach =>
          currentUserLearn.some(myLearn => skillsMatch(theirTeach.title, myLearn.title))
        );

        if (matchedTeachToLearn.length > 0 && matchedLearnFromTeach.length > 0) {
          reciprocalMatch = true;
          matchScore = 95 + Math.min(5, (matchedTeachToLearn.length + matchedLearnFromTeach.length) * 2);
        } else if (matchedLearnFromTeach.length > 0) {
          matchScore = 70 + Math.min(15, matchedLearnFromTeach.length * 5);
        } else if (matchedTeachToLearn.length > 0) {
          matchScore = 60 + Math.min(15, matchedTeachToLearn.length * 5);
        } else {
          // Category overlap bonus
          const myCats = new Set([...currentUserTeach.map(s => s.category), ...currentUserLearn.map(s => s.category)]);
          const theirCats = new Set([...teachSkills.map(s => s.category), ...learnSkills.map(s => s.category)]);
          let catOverlap = 0;
          for (const c of myCats) {
            if (theirCats.has(c)) catOverlap++;
          }
          matchScore = catOverlap > 0 ? 35 + catOverlap * 5 : 20;
        }
      }

      results.push({
        user: store.sanitizeUser(user),
        teachSkills,
        learnSkills,
        compatibility: currentUserId ? {
          score: Math.min(100, matchScore),
          isReciprocal: reciprocalMatch,
          canTeachThem: matchedTeachToLearn.map(s => s.title),
          canLearnFrom: matchedLearnFromTeach.map(s => s.title)
        } : null
      });
    }

    // Sort by compatibility score if logged in, otherwise by rating
    if (currentUserId) {
      results.sort((a, b) => (b.compatibility?.score || 0) - (a.compatibility?.score || 0));
    } else {
      results.sort((a, b) => (b.user.rating || 0) - (a.user.rating || 0));
    }

    res.json({
      total: results.length,
      partners: results
    });
  } catch (err) {
    console.error('Discovery error:', err);
    res.status(500).json({ error: 'Failed to search skill partners' });
  }
});

module.exports = router;
