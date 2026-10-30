const express = require('express');
const bcrypt = require('bcryptjs');
const store = require('../data/store');
const { generateToken, requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/auth/demo-users - List of demo accounts for quick switcher
router.get('/demo-users', (req, res) => {
  const demoList = store.users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    avatar: u.avatar,
    title: u.title,
    location: u.location,
    teachCount: store.getUserTeachSkills(u.id).length,
    learnCount: store.getUserLearnSkills(u.id).length
  }));
  res.json({ demoUsers: demoList });
});

// POST /api/auth/demo-login - 1-Click login as any demo profile
router.post('/demo-login', (req, res) => {
  const { userId } = req.body;
  const user = store.findUserById(userId || 'user_alex');
  if (!user) {
    return res.status(404).json({ error: 'Demo user not found' });
  }

  const token = generateToken(user);
  res.json({
    message: `Signed in as ${user.name}`,
    token,
    user: store.sanitizeUser(user)
  });
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, title, bio, location, timezone } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = store.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 8);
    const newUser = store.createUser({
      name: name.trim(),
      email: email.trim(),
      passwordHash,
      title: title ? title.trim() : 'Skill Swapper',
      bio: bio ? bio.trim() : 'Excited to learn and teach new skills!',
      location: location ? location.trim() : 'Remote / Worldwide',
      timezone: timezone ? timezone.trim() : 'UTC+0'
    });

    const token = generateToken(newUser);
    res.status(201).json({
      message: 'Registration successful! Welcome to SkillSwap.',
      token,
      user: store.sanitizeUser(newUser)
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = store.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);
    res.json({
      message: 'Login successful',
      token,
      user: store.sanitizeUser(user)
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// GET /api/auth/me - Current logged-in user profile with skills
router.get('/me', requireAuth, (req, res) => {
  const teachSkills = store.getUserTeachSkills(req.user.id);
  const learnSkills = store.getUserLearnSkills(req.user.id);
  const swaps = store.getSwapsForUser(req.user.id);

  const pendingIncoming = swaps.filter(s => s.receiverId === req.user.id && s.status === 'pending').length;
  const activeExchanges = swaps.filter(s => s.status === 'accepted').length;

  res.json({
    user: store.sanitizeUser(req.user),
    teachSkills,
    learnSkills,
    stats: {
      teachCount: teachSkills.length,
      learnCount: learnSkills.length,
      pendingIncoming,
      activeExchanges,
      hoursExchanged: req.user.hoursExchanged || 0,
      rating: req.user.rating || 5.0
    }
  });
});

module.exports = router;
