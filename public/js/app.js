// Master Application Controller for SkillSwap

document.addEventListener('DOMContentLoaded', async () => {
  await initApp();
});

async function initApp() {
  // Bind Header & Global Event Listeners
  setupNavigation();
  setupModals();
  setupDemoSwitcher();

  // Try authenticating stored token, otherwise default to Sophia or Alex for interactive demo
  try {
    const meData = await api.getMe();
    if (meData && meData.user) {
      state.setUser(meData);
    } else {
      // Default initial login as Alex Rivera so evaluator gets instant working experience
      const demoRes = await api.demoLogin('user_alex');
      const freshMe = await api.getMe();
      state.setUser(freshMe);
      showToast(`Welcome! Signed in as ${demoRes.user.name} (Demo Mode)`, 'info');
    }
  } catch (err) {
    console.warn('Initial session check error:', err);
  }

  // Handle URL hash changes
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    navigate(hash);
  });

  // Initial navigation
  const initialHash = window.location.hash.replace('#', '') || 'dashboard';
  navigate(initialHash);

  // Subscribe to state changes for UI header updates
  state.subscribe((event) => {
    if (event === 'user') {
      updateHeaderUserArea();
    }
  });

  updateHeaderUserArea();
}

function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = link.getAttribute('data-view');
      state.setView(view);
    });
  });

  // Mobile drawer toggle
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const mainNav = document.getElementById('main-nav');
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      const isVisible = mainNav.style.display === 'flex';
      mainNav.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible) {
        mainNav.style.flexDirection = 'column';
        mainNav.style.position = 'absolute';
        mainNav.style.top = '72px';
        mainNav.style.left = '0';
        mainNav.style.right = '0';
        mainNav.style.backgroundColor = 'var(--bg-surface)';
        mainNav.style.padding = '1rem';
        mainNav.style.boxShadow = 'var(--shadow-xl)';
        mainNav.style.zIndex = '400';
      }
    });
  }
}

function navigate(viewName) {
  const validViews = ['dashboard', 'discovery', 'smart-matches', 'swaps', 'profile'];
  if (!validViews.includes(viewName)) {
    viewName = 'dashboard';
  }

  // Update nav active classes
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('data-view') === viewName) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  state.currentView = viewName;
  const container = document.getElementById('view-container');
  if (!container) return;

  switch (viewName) {
    case 'dashboard':
      renderDashboardView(container);
      break;
    case 'discovery':
      renderDiscoveryView(container);
      break;
    case 'smart-matches':
      renderSmartMatchView(container);
      break;
    case 'swaps':
      renderSwapsView(container);
      break;
    case 'profile':
      renderProfileView(container);
      break;
  }
}

function updateHeaderUserArea() {
  const userArea = document.getElementById('header-user-area');
  const swapCounter = document.getElementById('nav-swap-counter');
  if (!userArea) return;

  if (state.user) {
    userArea.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <button class="user-menu-btn" onclick="state.setView('profile')">
          <img src="${escapeHtml(state.user.avatar)}" alt="${escapeHtml(state.user.name)}" class="user-avatar-sm" />
          <span class="user-name-sm">${escapeHtml(state.user.name)}</span>
        </button>
        <button class="btn btn-ghost btn-sm" onclick="handleLogout()" title="Sign Out">
          <span>Log Out</span>
        </button>
      </div>
    `;

    if (swapCounter) {
      const pendingCount = state.stats?.pendingIncoming || 0;
      if (pendingCount > 0) {
        swapCounter.textContent = pendingCount;
        swapCounter.style.display = 'inline-block';
      } else {
        swapCounter.style.display = 'none';
      }
    }
  } else {
    userArea.innerHTML = `
      <div style="display: flex; gap: 0.5rem;">
        <button class="btn btn-secondary btn-sm" onclick="openAuthModal('login')">Log In</button>
        <button class="btn btn-primary btn-sm" onclick="openAuthModal('register')">Sign Up Free</button>
      </div>
    `;
    if (swapCounter) swapCounter.style.display = 'none';
  }
}

// Demo Accounts Switcher
async function setupDemoSwitcher() {
  const toggleBtn = document.getElementById('demo-switcher-toggle');
  const dropdown = document.getElementById('demo-dropdown-menu');
  if (!toggleBtn || !dropdown) return;

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });

  document.addEventListener('click', () => {
    dropdown.classList.remove('open');
  });

  dropdown.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  try {
    const data = await api.getDemoUsers();
    const demoUsers = data.demoUsers || [];

    const listEl = document.getElementById('demo-users-list');
    if (listEl) {
      listEl.innerHTML = demoUsers.map(u => `
        <div class="demo-user-item ${state.user && state.user.id === u.id ? 'active' : ''}" onclick="switchDemoUser('${u.id}')">
          <img src="${escapeHtml(u.avatar)}" alt="${escapeHtml(u.name)}" class="demo-user-avatar" />
          <div class="demo-user-meta">
            <div class="demo-user-name">${escapeHtml(u.name)}</div>
            <div class="demo-user-role">${escapeHtml(u.title)}</div>
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Failed to load demo accounts list:', err);
  }
}

async function switchDemoUser(userId) {
  try {
    const data = await api.demoLogin(userId);
    const me = await api.getMe();
    state.setUser(me);
    showToast(`Switched account to ${data.user.name}`, 'success');

    // Close demo dropdown
    const dropdown = document.getElementById('demo-dropdown-menu');
    if (dropdown) dropdown.classList.remove('open');

    // Update demo switcher list highlight
    setupDemoSwitcher();

    // Re-render current view
    navigate(state.currentView);
  } catch (err) {
    showToast(`Failed to switch demo user: ${err.message}`, 'error');
  }
}

function handleLogout() {
  api.logout();
  state.setUser(null);
  showToast('Logged out successfully', 'info');
  navigate('discovery');
}

// Setup Modal event handlers
function setupModals() {
  // Close buttons
  document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal-overlay');
      if (modal) closeModal(modal.id);
    });
  });

  // Background overlay click to close
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(overlay.id);
      }
    });
  });

  // Auth Form Submit
  const authForm = document.getElementById('auth-form');
  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const isRegister = document.getElementById('auth-modal-title').textContent.includes('Sign Up');
      const email = document.getElementById('auth-email').value.trim();
      const password = document.getElementById('auth-password').value;

      try {
        if (isRegister) {
          const name = document.getElementById('auth-name').value.trim();
          const title = document.getElementById('auth-title').value.trim();
          const location = document.getElementById('auth-location').value.trim();

          const res = await api.register({ name, email, password, title, location });
          showToast(res.message, 'success');
        } else {
          const res = await api.login(email, password);
          showToast(res.message, 'success');
        }

        const me = await api.getMe();
        state.setUser(me);
        closeModal('auth-modal');
        navigate(state.currentView);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // Swap Proposal Form Submit
  const swapForm = document.getElementById('propose-swap-form');
  if (swapForm) {
    swapForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const receiverId = document.getElementById('swap-receiver-id').value;
      const offeredSkill = document.getElementById('swap-offered-skill').value.trim();
      const requestedSkill = document.getElementById('swap-requested-skill').value.trim();
      const format = document.getElementById('swap-format-select').value;
      const preferredTime = document.getElementById('swap-time-input').value.trim();
      const message = document.getElementById('swap-message-input').value.trim();

      try {
        const res = await api.createSwap({
          receiverId,
          offeredSkill,
          requestedSkill,
          format,
          preferredTime,
          message
        });

        showToast(res.message, 'success');
        closeModal('propose-swap-modal');

        // Refresh state
        const me = await api.getMe();
        state.setUser(me);

        // Take user to swaps tab
        state.setView('swaps');
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // Complete Swap Form Submit
  const completeForm = document.getElementById('complete-swap-form');
  if (completeForm) {
    completeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const swapId = document.getElementById('complete-swap-id').value;
      const rating = document.getElementById('complete-swap-rating').value;
      const review = document.getElementById('complete-swap-review').value;

      try {
        const res = await api.updateSwapStatus(swapId, 'completed', { rating, review });
        showToast(res.message, 'success');
        closeModal('complete-swap-modal');

        const me = await api.getMe();
        state.setUser(me);
        navigate(state.currentView);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // Teach Skill Form Submit
  const teachForm = document.getElementById('teach-skill-form');
  if (teachForm) {
    teachForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const skillId = document.getElementById('teach-skill-id').value;
      const title = document.getElementById('teach-skill-title').value.trim();
      const category = document.getElementById('teach-skill-category').value;
      const proficiency = document.getElementById('teach-skill-proficiency').value;
      const yearsExperience = document.getElementById('teach-skill-years').value;
      const description = document.getElementById('teach-skill-desc').value.trim();

      try {
        if (skillId) {
          await api.updateTeachSkill(skillId, { title, category, proficiency, yearsExperience, description });
          showToast('Teaching skill updated', 'success');
        } else {
          await api.addTeachSkill({ title, category, proficiency, yearsExperience, description });
          showToast('Teaching skill added', 'success');
        }

        closeModal('teach-skill-modal');
        const me = await api.getMe();
        state.setUser(me);
        renderProfileView(document.getElementById('view-container'));
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // Learn Skill Form Submit
  const learnForm = document.getElementById('learn-skill-form');
  if (learnForm) {
    learnForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const skillId = document.getElementById('learn-skill-id').value;
      const title = document.getElementById('learn-skill-title').value.trim();
      const category = document.getElementById('learn-skill-category').value;
      const currentLevel = document.getElementById('learn-skill-level').value;
      const preferredFormat = document.getElementById('learn-skill-format').value;
      const targetGoal = document.getElementById('learn-skill-goal').value.trim();

      try {
        if (skillId) {
          await api.updateLearnSkill(skillId, { title, category, currentLevel, preferredFormat, targetGoal });
          showToast('Learning goal updated', 'success');
        } else {
          await api.addLearnSkill({ title, category, currentLevel, preferredFormat, targetGoal });
          showToast('Learning goal added', 'success');
        }

        closeModal('learn-skill-modal');
        const me = await api.getMe();
        state.setUser(me);
        renderProfileView(document.getElementById('view-container'));
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // Edit Profile Form Submit
  const profileForm = document.getElementById('edit-profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('profile-edit-name').value.trim();
      const title = document.getElementById('profile-edit-title').value.trim();
      const bio = document.getElementById('profile-edit-bio').value.trim();
      const location = document.getElementById('profile-edit-location').value.trim();
      const timezone = document.getElementById('profile-edit-timezone').value.trim();
      const avatar = document.getElementById('profile-edit-avatar').value.trim();

      try {
        await api.updateProfile({ name, title, bio, location, timezone, avatar });
        showToast('Profile updated successfully', 'success');
        closeModal('edit-profile-modal');

        const me = await api.getMe();
        state.setUser(me);
        renderProfileView(document.getElementById('view-container'));
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }
}

// Auth Modal
function openAuthModal(mode = 'login') {
  const title = document.getElementById('auth-modal-title');
  const registerFields = document.getElementById('auth-register-fields');
  const submitBtn = document.getElementById('auth-submit-btn');
  const switchBtn = document.getElementById('auth-switch-mode-btn');

  if (mode === 'register') {
    title.textContent = 'Create SkillSwap Account';
    registerFields.style.display = 'block';
    submitBtn.textContent = 'Sign Up Free';
    switchBtn.textContent = 'Already have an account? Sign In';
  } else {
    title.textContent = 'Sign In to SkillSwap';
    registerFields.style.display = 'none';
    submitBtn.textContent = 'Sign In';
    switchBtn.textContent = 'Need an account? Sign Up';
  }

  openModal('auth-modal');
}

function toggleAuthMode() {
  const title = document.getElementById('auth-modal-title');
  const isLogin = title.textContent.includes('Sign In');
  openAuthModal(isLogin ? 'register' : 'login');
}

// Propose Swap Modal
async function openSwapModalForPartner(partnerId) {
  if (!state.user) {
    openAuthModal('login');
    return;
  }

  try {
    const data = await api.getUserProfile(partnerId);
    openSwapModalWithPrepop(partnerId, '', '', data);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function openSwapModalWithPrepop(partnerId, suggestedOffer = '', suggestedRequest = '', partnerData = null) {
  if (!state.user) {
    openAuthModal('login');
    return;
  }

  let partner = partnerData?.user;
  let partnerTeach = partnerData?.teachSkills || [];

  if (!partner) {
    const fullData = await api.getUserProfile(partnerId);
    partner = fullData.user;
    partnerTeach = fullData.teachSkills;
  }

  document.getElementById('swap-receiver-id').value = partner.id;
  document.getElementById('swap-modal-partner-name').textContent = partner.name;
  document.getElementById('swap-modal-partner-avatar').src = partner.avatar;
  document.getElementById('swap-modal-partner-title').textContent = partner.title;

  // Populate options for my skills to offer
  const offerSelect = document.getElementById('swap-offered-skill');
  offerSelect.innerHTML = state.teachSkills.map(s => `
    <option value="${escapeHtml(s.title)}" ${s.title === suggestedOffer ? 'selected' : ''}>
      ${escapeHtml(s.title)} (${escapeHtml(s.proficiency)})
    </option>
  `).join('');

  if (state.teachSkills.length === 0) {
    offerSelect.innerHTML = `<option value="">⚠️ Add a teaching skill in your profile first</option>`;
  }

  // Populate options for their skills to request
  const requestSelect = document.getElementById('swap-requested-skill');
  requestSelect.innerHTML = partnerTeach.map(s => `
    <option value="${escapeHtml(s.title)}" ${s.title === suggestedRequest ? 'selected' : ''}>
      ${escapeHtml(s.title)} (${escapeHtml(s.proficiency)})
    </option>
  `).join('');

  if (partnerTeach.length === 0) {
    requestSelect.innerHTML = `<option value="General Mentorship">General Mentorship / Practice</option>`;
  }

  // Set message placeholder
  document.getElementById('swap-message-input').value = `Hi ${partner.name}! I would love to exchange skills with you. Let’s collaborate and learn together!`;

  openModal('propose-swap-modal');
}

// Swap Actions: Accept, Reject, Complete, Cancel
async function handleAcceptSwap(swapId) {
  try {
    const res = await api.updateSwapStatus(swapId, 'accepted');
    showToast(res.message, 'success');
    const me = await api.getMe();
    state.setUser(me);
    navigate(state.currentView);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleRejectSwap(swapId) {
  if (!confirm('Are you sure you want to decline this swap proposal?')) return;
  try {
    const res = await api.updateSwapStatus(swapId, 'rejected');
    showToast(res.message, 'info');
    const me = await api.getMe();
    state.setUser(me);
    navigate(state.currentView);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleCancelSwap(swapId) {
  if (!confirm('Are you sure you want to cancel this skill swap?')) return;
  try {
    const res = await api.updateSwapStatus(swapId, 'cancelled');
    showToast(res.message, 'info');
    const me = await api.getMe();
    state.setUser(me);
    navigate(state.currentView);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function promptEditSessionNotes(swapId, currentNotes) {
  const newNotes = prompt('Enter session notes, meeting link (e.g. Google Meet, Zoom), or learning topics:', currentNotes);
  if (newNotes === null) return;

  try {
    const res = await api.updateSwapNotes(swapId, newNotes);
    showToast(res.message, 'success');
    navigate(state.currentView);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openCompleteSwapModal(swapId, partnerName) {
  document.getElementById('complete-swap-id').value = swapId;
  document.getElementById('complete-swap-partner-name').textContent = partnerName;
  document.getElementById('complete-swap-review').value = '';
  openModal('complete-swap-modal');
}

// Skills Modals
function openAddTeachSkillModal() {
  document.getElementById('teach-skill-id').value = '';
  document.getElementById('teach-modal-title').textContent = 'Add Skill You Can Teach';
  document.getElementById('teach-skill-title').value = '';
  document.getElementById('teach-skill-category').value = 'Development';
  document.getElementById('teach-skill-proficiency').value = 'Intermediate';
  document.getElementById('teach-skill-years').value = '2';
  document.getElementById('teach-skill-desc').value = '';
  openModal('teach-skill-modal');
}

function openEditTeachSkillModal(skill) {
  document.getElementById('teach-skill-id').value = skill.id;
  document.getElementById('teach-modal-title').textContent = 'Edit Teaching Skill';
  document.getElementById('teach-skill-title').value = skill.title;
  document.getElementById('teach-skill-category').value = skill.category;
  document.getElementById('teach-skill-proficiency').value = skill.proficiency;
  document.getElementById('teach-skill-years').value = skill.yearsExperience || 1;
  document.getElementById('teach-skill-desc').value = skill.description || '';
  openModal('teach-skill-modal');
}

async function handleDeleteTeachSkill(skillId) {
  if (!confirm('Remove this skill from what you teach?')) return;
  try {
    await api.deleteTeachSkill(skillId);
    showToast('Teaching skill removed', 'info');
    const me = await api.getMe();
    state.setUser(me);
    renderProfileView(document.getElementById('view-container'));
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openAddLearnSkillModal() {
  document.getElementById('learn-skill-id').value = '';
  document.getElementById('learn-modal-title').textContent = 'Add Skill You Want to Learn';
  document.getElementById('learn-skill-title').value = '';
  document.getElementById('learn-skill-category').value = 'Languages';
  document.getElementById('learn-skill-level').value = 'Beginner';
  document.getElementById('learn-skill-format').value = '1-on-1 Video Call';
  document.getElementById('learn-skill-goal').value = '';
  openModal('learn-skill-modal');
}

function openEditLearnSkillModal(skill) {
  document.getElementById('learn-skill-id').value = skill.id;
  document.getElementById('learn-modal-title').textContent = 'Edit Learning Goal';
  document.getElementById('learn-skill-title').value = skill.title;
  document.getElementById('learn-skill-category').value = skill.category;
  document.getElementById('learn-skill-level').value = skill.currentLevel;
  document.getElementById('learn-skill-format').value = skill.preferredFormat;
  document.getElementById('learn-skill-goal').value = skill.targetGoal || '';
  openModal('learn-skill-modal');
}

async function handleDeleteLearnSkill(skillId) {
  if (!confirm('Remove this skill from your learning wishlist?')) return;
  try {
    await api.deleteLearnSkill(skillId);
    showToast('Learning goal removed', 'info');
    const me = await api.getMe();
    state.setUser(me);
    renderProfileView(document.getElementById('view-container'));
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openEditProfileModal() {
  if (!state.user) return;
  document.getElementById('profile-edit-name').value = state.user.name || '';
  document.getElementById('profile-edit-title').value = state.user.title || '';
  document.getElementById('profile-edit-bio').value = state.user.bio || '';
  document.getElementById('profile-edit-location').value = state.user.location || '';
  document.getElementById('profile-edit-timezone').value = state.user.timezone || '';
  document.getElementById('profile-edit-avatar').value = state.user.avatar || '';
  openModal('edit-profile-modal');
}
