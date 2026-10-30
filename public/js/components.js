// Reusable UI Components and Rendering Helpers for SkillSwap

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '⚠️';

  toast.innerHTML = `
    <span style="font-size: 1.1rem;">${icon}</span>
    <div style="flex: 1; font-size: 0.875rem; font-weight: 500;">${escapeHtml(message)}</div>
    <button style="color: var(--text-muted); cursor: pointer;" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }
  }, 4500);
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderProficiencyBadge(level) {
  switch ((level || '').toLowerCase()) {
    case 'expert':
      return `<span class="badge badge-emerald">⭐ Expert</span>`;
    case 'advanced':
      return `<span class="badge badge-primary">⚡ Advanced</span>`;
    case 'intermediate':
      return `<span class="badge badge-amber">🔷 Intermediate</span>`;
    case 'beginner':
    default:
      return `<span class="badge badge-gray">🌱 Beginner</span>`;
  }
}

function renderCategoryBadge(category) {
  return `<span class="badge badge-purple">${escapeHtml(category || 'General')}</span>`;
}

function renderCompatibilityPill(compatibility) {
  if (!compatibility) return '';

  if (compatibility.isReciprocal) {
    return `
      <div class="match-pill-reciprocal">
        <span>🔄</span>
        <span>${compatibility.score}% Perfect Mutual Match</span>
      </div>
    `;
  }

  if (compatibility.score >= 60) {
    return `
      <div class="match-meter high">
        <span>🎯</span>
        <span>${compatibility.score}% Match</span>
      </div>
    `;
  }

  return `
    <div class="badge badge-gray">
      <span>🤝 ${compatibility.score}% Affinity</span>
    </div>
  `;
}

function renderPartnerCard(item, currentUser) {
  const user = item.user;
  const teachSkills = item.teachSkills || [];
  const learnSkills = item.learnSkills || [];
  const compatibility = item.compatibility;

  const isSelf = currentUser && currentUser.id === user.id;

  return `
    <article class="card card-interactive partner-card" data-user-id="${user.id}">
      <div>
        <div class="partner-header">
          <img src="${escapeHtml(user.avatar)}" alt="${escapeHtml(user.name)}" class="partner-avatar" />
          <div class="partner-headline">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
              <h3 class="partner-name">${escapeHtml(user.name)}</h3>
              ${renderCompatibilityPill(compatibility)}
            </div>
            <p class="partner-role">${escapeHtml(user.title || 'SkillSwap Member')}</p>
            <div class="partner-location">
              <span>📍 ${escapeHtml(user.location || 'Remote')}</span>
              <span>•</span>
              <span style="color: #b45309; font-weight: 600;">⭐ ${user.rating || 5.0} (${user.reviewsCount || 0} reviews)</span>
              <span>•</span>
              <span>⏱️ ${user.hoursExchanged || 0}h swapped</span>
            </div>
          </div>
        </div>

        <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1rem; line-height: 1.5;">
          ${escapeHtml(user.bio || 'Passionate about sharing knowledge.')}
        </p>

        <!-- Teaching Skills -->
        <div class="partner-skills-section">
          <div class="skill-list-title">
            <span>🎓 Can Teach (${teachSkills.length})</span>
          </div>
          <div class="skill-pill-container">
            ${teachSkills.length > 0 ? teachSkills.map(s => `
              <span class="badge badge-primary" title="${escapeHtml(s.description || '')}">
                ${escapeHtml(s.title)} ${renderProficiencyBadge(s.proficiency)}
              </span>
            `).join('') : '<span style="font-size: 0.8125rem; color: var(--text-muted);">None listed yet</span>'}
          </div>
        </div>

        <!-- Learning Skills -->
        <div class="partner-skills-section" style="margin-top: 0.5rem; padding-top: 0.5rem;">
          <div class="skill-list-title">
            <span>🎯 Wants to Learn (${learnSkills.length})</span>
          </div>
          <div class="skill-pill-container">
            ${learnSkills.length > 0 ? learnSkills.map(s => `
              <span class="badge badge-amber" title="Goal: ${escapeHtml(s.targetGoal || '')}">
                ${escapeHtml(s.title)} (${escapeHtml(s.currentLevel || 'Beginner')})
              </span>
            `).join('') : '<span style="font-size: 0.8125rem; color: var(--text-muted);">Open to anything</span>'}
          </div>
        </div>

        ${compatibility && (compatibility.canTeachThem.length > 0 || compatibility.canLearnFrom.length > 0) ? `
          <div style="background-color: var(--accent-emerald-light); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: var(--radius-sm); padding: 0.625rem; margin-top: 0.75rem; font-size: 0.8125rem; color: #065f46;">
            ${compatibility.isReciprocal ? `
              <strong>✨ Mutual Win-Win:</strong> You teach <em>${compatibility.canTeachThem.join(', ')}</em> & learn <em>${compatibility.canLearnFrom.join(', ')}</em>!
            ` : compatibility.canLearnFrom.length > 0 ? `
              <strong>💡 Wishlist Match:</strong> Can teach you <em>${compatibility.canLearnFrom.join(', ')}</em>!
            ` : `
              <strong>🤝 Partner Opportunity:</strong> Wants to learn <em>${compatibility.canTeachThem.join(', ')}</em>!
            `}
          </div>
        ` : ''}
      </div>

      <div style="margin-top: 1.25rem; pt: 0.5rem; display: flex; gap: 0.75rem;">
        ${!isSelf ? `
          <button class="btn btn-primary" style="flex: 1;" onclick="openSwapModalForPartner('${user.id}')">
            <span>🤝 Request Skill Swap</span>
          </button>
        ` : `
          <button class="btn btn-secondary" style="flex: 1;" disabled>
            <span>This is You</span>
          </button>
        `}
        <button class="btn btn-secondary" onclick="viewUserProfile('${user.id}')" title="View Full Profile">
          <span>👤 Profile</span>
        </button>
      </div>
    </article>
  `;
}
