const fs = require('fs');
const path = require('path');
const { seedUsers, seedTeachSkills, seedLearnSkills, seedSwaps } = require('./seed');

const DB_FILE = path.join(__dirname, 'skillswap-db.json');

class Store {
  constructor() {
    this.users = [];
    this.teachSkills = [];
    this.learnSkills = [];
    this.swaps = [];
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
        this.users = data.users || [];
        this.teachSkills = data.teachSkills || [];
        this.learnSkills = data.learnSkills || [];
        this.swaps = data.swaps || [];
      } else {
        this.resetToSeed();
      }
    } catch (err) {
      console.error('Error loading DB file, resetting to seed data:', err);
      this.resetToSeed();
    }
  }

  resetToSeed() {
    this.users = JSON.parse(JSON.stringify(seedUsers));
    this.teachSkills = JSON.parse(JSON.stringify(seedTeachSkills));
    this.learnSkills = JSON.parse(JSON.stringify(seedLearnSkills));
    this.swaps = JSON.parse(JSON.stringify(seedSwaps));
    this.save();
  }

  save() {
    try {
      const data = {
        users: this.users,
        teachSkills: this.teachSkills,
        learnSkills: this.learnSkills,
        swaps: this.swaps,
        updatedAt: new Date().toISOString()
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save to database file:', err);
    }
  }

  // --- Users ---
  findUserById(id) {
    return this.users.find(u => u.id === id);
  }

  findUserByEmail(email) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  sanitizeUser(user) {
    if (!user) return null;
    const { passwordHash, ...safe } = user;
    return safe;
  }

  createUser(userData) {
    const id = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newUser = {
      id,
      name: userData.name,
      email: userData.email,
      passwordHash: userData.passwordHash,
      avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.name)}`,
      title: userData.title || 'New Skill Swapper',
      bio: userData.bio || 'Excited to learn and teach new skills!',
      location: userData.location || 'Remote / Worldwide',
      timezone: userData.timezone || 'UTC+0',
      rating: 5.0,
      reviewsCount: 0,
      hoursExchanged: 0,
      memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    };
    this.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUser(id, updates) {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return null;

    const allowed = ['name', 'avatar', 'title', 'bio', 'location', 'timezone'];
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        this.users[idx][key] = updates[key];
      }
    }
    this.save();
    return this.users[idx];
  }

  // --- Teach Skills ---
  getUserTeachSkills(userId) {
    return this.teachSkills.filter(s => s.userId === userId);
  }

  addTeachSkill(userId, skillData) {
    const id = 'ts_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newSkill = {
      id,
      userId,
      title: skillData.title.trim(),
      category: skillData.category || 'General',
      proficiency: skillData.proficiency || 'Intermediate',
      yearsExperience: Number(skillData.yearsExperience) || 1,
      description: skillData.description ? skillData.description.trim() : ''
    };
    this.teachSkills.push(newSkill);
    this.save();
    return newSkill;
  }

  updateTeachSkill(userId, skillId, updates) {
    const idx = this.teachSkills.findIndex(s => s.id === skillId && s.userId === userId);
    if (idx === -1) return null;

    if (updates.title) this.teachSkills[idx].title = updates.title.trim();
    if (updates.category) this.teachSkills[idx].category = updates.category;
    if (updates.proficiency) this.teachSkills[idx].proficiency = updates.proficiency;
    if (updates.yearsExperience !== undefined) this.teachSkills[idx].yearsExperience = Number(updates.yearsExperience);
    if (updates.description !== undefined) this.teachSkills[idx].description = updates.description.trim();

    this.save();
    return this.teachSkills[idx];
  }

  deleteTeachSkill(userId, skillId) {
    const initialLen = this.teachSkills.length;
    this.teachSkills = this.teachSkills.filter(s => !(s.id === skillId && s.userId === userId));
    const deleted = this.teachSkills.length < initialLen;
    if (deleted) this.save();
    return deleted;
  }

  // --- Learn Skills ---
  getUserLearnSkills(userId) {
    return this.learnSkills.filter(s => s.userId === userId);
  }

  addLearnSkill(userId, skillData) {
    const id = 'ls_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newSkill = {
      id,
      userId,
      title: skillData.title.trim(),
      category: skillData.category || 'General',
      currentLevel: skillData.currentLevel || 'Beginner',
      targetGoal: skillData.targetGoal ? skillData.targetGoal.trim() : '',
      preferredFormat: skillData.preferredFormat || '1-on-1 Video Call'
    };
    this.learnSkills.push(newSkill);
    this.save();
    return newSkill;
  }

  updateLearnSkill(userId, skillId, updates) {
    const idx = this.learnSkills.findIndex(s => s.id === skillId && s.userId === userId);
    if (idx === -1) return null;

    if (updates.title) this.learnSkills[idx].title = updates.title.trim();
    if (updates.category) this.learnSkills[idx].category = updates.category;
    if (updates.currentLevel) this.learnSkills[idx].currentLevel = updates.currentLevel;
    if (updates.targetGoal !== undefined) this.learnSkills[idx].targetGoal = updates.targetGoal.trim();
    if (updates.preferredFormat !== undefined) this.learnSkills[idx].preferredFormat = updates.preferredFormat;

    this.save();
    return this.learnSkills[idx];
  }

  deleteLearnSkill(userId, skillId) {
    const initialLen = this.learnSkills.length;
    this.learnSkills = this.learnSkills.filter(s => !(s.id === skillId && s.userId === userId));
    const deleted = this.learnSkills.length < initialLen;
    if (deleted) this.save();
    return deleted;
  }

  // --- Swap Requests ---
  createSwapRequest(senderId, data) {
    const id = 'swap_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newSwap = {
      id,
      senderId,
      receiverId: data.receiverId,
      offeredSkill: data.offeredSkill,
      requestedSkill: data.requestedSkill,
      status: 'pending',
      message: data.message || '',
      format: data.format || '1-on-1 Video Call',
      preferredTime: data.preferredTime || 'Flexible / To be coordinated',
      createdAt: new Date().toISOString(),
      acceptedAt: null,
      completedAt: null,
      rating: null,
      review: null,
      notes: ''
    };
    this.swaps.unshift(newSwap);
    this.save();
    return newSwap;
  }

  getSwapsForUser(userId) {
    return this.swaps.filter(s => s.senderId === userId || s.receiverId === userId);
  }

  getSwapById(id) {
    return this.swaps.find(s => s.id === id);
  }

  updateSwapStatus(swapId, userId, newStatus, extraData = {}) {
    const swap = this.swaps.find(s => s.id === swapId);
    if (!swap) return null;

    // Check authorization:
    // Receiver can accept or reject pending
    // Either party can cancel or mark complete
    if (newStatus === 'accepted' || newStatus === 'rejected') {
      if (swap.receiverId !== userId) {
        throw new Error('Only the recipient can accept or reject this swap request');
      }
      swap.status = newStatus;
      if (newStatus === 'accepted') {
        swap.acceptedAt = new Date().toISOString();
        if (extraData.notes) swap.notes = extraData.notes;
      }
    } else if (newStatus === 'completed') {
      if (swap.senderId !== userId && swap.receiverId !== userId) {
        throw new Error('Unauthorized');
      }
      swap.status = 'completed';
      swap.completedAt = new Date().toISOString();
      if (extraData.rating) swap.rating = Number(extraData.rating);
      if (extraData.review) swap.review = extraData.review.trim();

      // Increment hours exchanged for both users
      const u1 = this.findUserById(swap.senderId);
      const u2 = this.findUserById(swap.receiverId);
      if (u1) u1.hoursExchanged = (u1.hoursExchanged || 0) + 2;
      if (u2) u2.hoursExchanged = (u2.hoursExchanged || 0) + 2;
    } else if (newStatus === 'cancelled') {
      if (swap.senderId !== userId && swap.receiverId !== userId) {
        throw new Error('Unauthorized');
      }
      swap.status = 'cancelled';
    }

    if (extraData.notes !== undefined) {
      swap.notes = extraData.notes;
    }

    this.save();
    return swap;
  }
}

const store = new Store();
module.exports = store;
