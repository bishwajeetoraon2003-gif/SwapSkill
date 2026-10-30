// User Profile & Skill Management View for SkillSwap

let activeProfileUserId = null;

async function renderProfileView(container, targetUserId = null) {
  activeProfileUserId = targetUserId || (state.user ? state.user.id : null);

  if (!activeProfileUserId) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">👤</div>
        <h2 class="empty-state-title">Sign in to view or edit your profile</h2>
        <button class="btn btn-primary" onclick="openAuthModal('login')">Sign In</button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="text-align: center; padding: 3rem;">
      <div style="font-size: 2rem; margin-bottom: 0.5rem;">⏳</div>
      <p style="color: var(--text-muted);">Loading member profile...</p>
    </div>
  `;

  try {
    const data = await api.getUserProfile(activeProfileUserId);
    const user = data.user;
    const teachSkills = data.teachSkills || [];
    const learnSkills = data.learnSkills || [];
    const reviews = data.reviews || [];

    const isOwnProfile = state.user && state.user.id === user.id;

    container.innerHTML = `
      <!-- Profile Header Hero -->
      <div class="card" style="margin-bottom: 2rem; padding: 2rem; background: linear-gradient(to right, #ffffff, var(--bg-subtle));">
        <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem;">
          <div style="display: flex; gap: 1.5rem; align-items: center; flex-wrap: wrap;">
            <img 
              src="${escapeHtml(user.avatar)}" 
              alt="${escapeHtml(user.name)}" 
              style="width: 96px; height: 96px; border-radius: var(--radius-lg); object-fit: cover; box-shadow: var(--shadow-md); border: 3px solid white;"
            />
            <div>
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <h1 style="font-size: 1.75rem; font-weight: 800; color: var(--text-main);">${escapeHtml(user.name)}</h1>
                ${isOwnProfile ? '<span class="badge badge-emerald">Your Account</span>' : ''}
              </div>
              <p style="font-size: 1rem; color: var(--text-muted); margin-top: 0.25rem; font-weight: 500;">
                ${escapeHtml(user.title || 'SkillSwap Member')}
              </p>
              <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; margin-top: 0.5rem; font-size: 0.8125rem; color: var(--text-muted);">
                <span>📍 ${escapeHtml(user.location || 'Remote')}</span>
                <span>🕒 ${escapeHtml(user.timezone || 'UTC')}</span>
                <span>⭐ <strong>${user.rating || 5.0}</strong> (${user.reviewsCount || reviews.length} reviews)</span>
                <span>⏱️ <strong>${user.hoursExchanged || 0}</strong> hours exchanged</span>
                <span>📅 Member since ${escapeHtml(user.memberSince || '2025')}</span>
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 0.75rem;">
            ${isOwnProfile ? `
              <button class="btn btn-secondary" onclick="openEditProfileModal()">
                <span>✏️ Edit Profile Info</span>
              </button>
            ` : `
              <button class="btn btn-primary" onclick="openSwapModalForPartner('${user.id}')">
                <span>🤝 Request Skill Swap</span>
              </button>
            `}
          </div>
        </div>

        <div style="margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px solid var(--border-light);">
          <h4 style="font-size: 0.8125rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.5rem;">
            About & Learning Philosophy
          </h4>
          <p style="font-size: 0.9375rem; color: var(--text-main); line-height: 1.6; max-width: 850px;">
            ${escapeHtml(user.bio || 'Passionate about peer-to-peer knowledge sharing and collaboration.')}
          </p>
        </div>
      </div>

      <!-- Skills Management Section: 2 Columns (Teach vs Learn) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 2rem; margin-bottom: 2.5rem;">
        
        <!-- Column 1: Skills I Can Teach -->
        <div class="card">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-light);">
            <div>
              <h2 style="font-size: 1.25rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem;">
                <span>🎓 Skills ${isOwnProfile ? 'I Can Teach' : 'They Teach'}</span>
                <span class="badge badge-primary">${teachSkills.length}</span>
              </h2>
            </div>
            ${isOwnProfile ? `
              <button class="btn btn-primary btn-sm" onclick="openAddTeachSkillModal()">
                <span>+ Add Skill</span>
              </button>
            ` : ''}
          </div>

          ${teachSkills.length > 0 ? `
            <div style="display: grid; gap: 1rem;">
              ${teachSkills.map(s => `
                <div style="background-color: var(--bg-subtle); border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 1rem;">
                  <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.35rem;">
                    <div>
                      <h4 style="font-size: 1rem; font-weight: 700;">${escapeHtml(s.title)}</h4>
                      <div style="display: flex; gap: 0.35rem; align-items: center; margin-top: 0.25rem;">
                        ${renderCategoryBadge(s.category)}
                        ${renderProficiencyBadge(s.proficiency)}
                        <span style="font-size: 0.75rem; color: var(--text-light);">${s.yearsExperience || 1} yrs exp</span>
                      </div>
                    </div>

                    ${isOwnProfile ? `
                      <div style="display: flex; gap: 0.25rem;">
                        <button class="btn btn-ghost btn-sm" style="padding: 0.2rem 0.4rem;" onclick='openEditTeachSkillModal(${JSON.stringify(s)})' title="Edit">✏️</button>
                        <button class="btn btn-ghost btn-sm" style="padding: 0.2rem 0.4rem; color: var(--accent-rose);" onclick="handleDeleteTeachSkill('${s.id}')" title="Delete">🗑️</button>
                      </div>
                    ` : ''}
                  </div>

                  ${s.description ? `
                    <p style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 0.5rem; line-height: 1.4;">
                      ${escapeHtml(s.description)}
                    </p>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="empty-state" style="padding: 2rem;">
              <p class="empty-state-desc">No teaching skills listed yet.</p>
              ${isOwnProfile ? `<button class="btn btn-primary btn-sm" onclick="openAddTeachSkillModal()">Add First Teaching Skill</button>` : ''}
            </div>
          `}
        </div>

        <!-- Column 2: Skills I Want to Learn -->
        <div class="card">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-light);">
            <div>
              <h2 style="font-size: 1.25rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem;">
                <span>🎯 Skills ${isOwnProfile ? 'I Want to Learn' : 'They Want to Learn'}</span>
                <span class="badge badge-amber">${learnSkills.length}</span>
              </h2>
            </div>
            ${isOwnProfile ? `
              <button class="btn btn-accent btn-sm" onclick="openAddLearnSkillModal()">
                <span>+ Add Goal</span>
              </button>
            ` : ''}
          </div>

          ${learnSkills.length > 0 ? `
            <div style="display: grid; gap: 1rem;">
              ${learnSkills.map(s => `
                <div style="background-color: var(--bg-subtle); border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 1rem;">
                  <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.35rem;">
                    <div>
                      <h4 style="font-size: 1rem; font-weight: 700;">${escapeHtml(s.title)}</h4>
                      <div style="display: flex; gap: 0.35rem; align-items: center; margin-top: 0.25rem;">
                        ${renderCategoryBadge(s.category)}
                        <span class="badge badge-amber">Level: ${escapeHtml(s.currentLevel || 'Beginner')}</span>
                        <span style="font-size: 0.75rem; color: var(--text-light);">${escapeHtml(s.preferredFormat || '1-on-1')}</span>
                      </div>
                    </div>

                    ${isOwnProfile ? `
                      <div style="display: flex; gap: 0.25rem;">
                        <button class="btn btn-ghost btn-sm" style="padding: 0.2rem 0.4rem;" onclick='openEditLearnSkillModal(${JSON.stringify(s)})' title="Edit">✏️</button>
                        <button class="btn btn-ghost btn-sm" style="padding: 0.2rem 0.4rem; color: var(--accent-rose);" onclick="handleDeleteLearnSkill('${s.id}')" title="Delete">🗑️</button>
                      </div>
                    ` : ''}
                  </div>

                  ${s.targetGoal ? `
                    <p style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 0.5rem; line-height: 1.4;">
                      <strong>Goal:</strong> ${escapeHtml(s.targetGoal)}
                    </p>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="empty-state" style="padding: 2rem;">
              <p class="empty-state-desc">No learning wishlist skills added yet.</p>
              ${isOwnProfile ? `<button class="btn btn-accent btn-sm" onclick="openAddLearnSkillModal()">Add First Learning Goal</button>` : ''}
            </div>
          `}
        </div>

      </div>

      <!-- Reputation & Reviews -->
      <section class="card">
        <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem;">
          ⭐ Community Reviews & Reputation (${reviews.length})
        </h3>

        ${reviews.length > 0 ? `
          <div style="display: grid; gap: 1rem;">
            ${reviews.map(r => `
              <div style="border-bottom: 1px solid var(--border-light); padding-bottom: 1rem;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem;">
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <img src="${escapeHtml(r.reviewerAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user')}" alt="${escapeHtml(r.reviewerName)}" style="width: 32px; height: 32px; border-radius: var(--radius-full); object-fit: cover;" />
                    <span style="font-weight: 600; font-size: 0.9375rem;">${escapeHtml(r.reviewerName)}</span>
                    <span style="font-size: 0.75rem; color: var(--text-light);">${r.date ? new Date(r.date).toLocaleDateString() : ''}</span>
                  </div>
                  <div style="color: #b45309; font-weight: 700; font-size: 0.875rem;">
                    ⭐ ${r.rating} / 5
                  </div>
                </div>
                <div style="font-size: 0.8125rem; color: var(--primary); font-weight: 600; margin-bottom: 0.25rem;">
                  Exchanged: ${escapeHtml(r.skillsExchanged)}
                </div>
                <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.5; font-style: italic;">
                  "${escapeHtml(r.review)}"
                </p>
              </div>
            `).join('')}
          </div>
        ` : `
          <p style="font-size: 0.875rem; color: var(--text-muted);">
            No reviews yet. Complete your first skill swap to build trust and reputation!
          </p>
        `}
      </section>
    `;
  } catch (err) {
    container.innerHTML = `
      <div class="card" style="border-left: 4px solid var(--accent-rose); padding: 1.5rem;">
        <h3 style="color: var(--accent-rose); font-weight: 700;">Failed to load profile</h3>
        <p style="color: var(--text-muted);">${escapeHtml(err.message)}</p>
      </div>
    `;
  }
}

function viewUserProfile(userId) {
  state.setView('profile');
  renderProfileView(document.getElementById('view-container'), userId);
}
