const express = require('express');
const store = require('../data/store');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const CATEGORIES = [
  'Development',
  'Design',
  'Languages',
  'Data Science',
  'Music',
  'Photography',
  'Marketing',
  'Business',
  'Writing',
  'Health & Fitness',
  'Crafts & DIY',
  'Cooking'
];

// GET /api/skills/categories
router.get('/categories', (req, res) => {
  res.json({ categories: CATEGORIES });
});

// --- Teach Skills ---
router.post('/teach', requireAuth, (req, res) => {
  try {
    const { title, category, proficiency, yearsExperience, description } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Skill title is required' });
    }

    const skill = store.addTeachSkill(req.user.id, {
      title,
      category,
      proficiency,
      yearsExperience,
      description
    });

    res.status(201).json({
      message: 'Teaching skill added successfully',
      skill
    });
  } catch (err) {
    console.error('Add teach skill error:', err);
    res.status(500).json({ error: 'Failed to add teaching skill' });
  }
});

router.put('/teach/:id', requireAuth, (req, res) => {
  try {
    const updated = store.updateTeachSkill(req.user.id, req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Skill not found or unauthorized' });
    }
    res.json({
      message: 'Teaching skill updated',
      skill: updated
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update skill' });
  }
});

router.delete('/teach/:id', requireAuth, (req, res) => {
  const deleted = store.deleteTeachSkill(req.user.id, req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Skill not found or unauthorized' });
  }
  res.json({ message: 'Teaching skill removed' });
});

// --- Learn Skills ---
router.post('/learn', requireAuth, (req, res) => {
  try {
    const { title, category, currentLevel, targetGoal, preferredFormat } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Skill title is required' });
    }

    const skill = store.addLearnSkill(req.user.id, {
      title,
      category,
      currentLevel,
      targetGoal,
      preferredFormat
    });

    res.status(201).json({
      message: 'Learning skill added successfully',
      skill
    });
  } catch (err) {
    console.error('Add learn skill error:', err);
    res.status(500).json({ error: 'Failed to add learning skill' });
  }
});

router.put('/learn/:id', requireAuth, (req, res) => {
  try {
    const updated = store.updateLearnSkill(req.user.id, req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Skill not found or unauthorized' });
    }
    res.json({
      message: 'Learning skill updated',
      skill: updated
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update skill' });
  }
});

router.delete('/learn/:id', requireAuth, (req, res) => {
  const deleted = store.deleteLearnSkill(req.user.id, req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Skill not found or unauthorized' });
  }
  res.json({ message: 'Learning skill removed' });
});

module.exports = router;
