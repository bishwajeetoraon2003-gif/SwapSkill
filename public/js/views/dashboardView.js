// Learning Dashboard View for SkillSwap

async function renderDashboardView(container) {
  if (!state.user) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔐</div>
        <h2 class="empty-state-title">Sign in to view your Learning Dashboard</h2>
        <p class="empty-state-desc">Track your active skill exchanges, pending proposals, session notes, and knowledge-sharing hours.</p>
        <button class="btn btn-primary" onclick="openAuthModal('login')">Sign In / Switch Demo Account</button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="text-align: center; padding: 3rem;">
      <div style="font-size: 2rem; margin-bottom: 0.5rem;">⏳</div>
      <p style="color: var(--text-muted);">Loading your learning dashboard...</p>
    </div>
  `;

  try {
    const data = await api.getDashboard();
    const stats = data.stats;
    const pendingIncoming = data.pendingIncoming || [];
    const activeExchanges = data.activeExchanges || [];
    const recentCompleted = data.recentCompleted || [];

    container.innerHTML = `
      <!-- Welcome Banner -->
      <section class="hero-banner" style="padding: 2.25rem 2rem; margin-bottom: 2rem;">
        <div class="hero-content" style="max-width: 100%;">
          <div class="hero-pill">
            <span>✨ Welcome back, ${escapeHtml(state.user.name)}</span>
          </div>
          <h1 class="hero-title" style="font-size: 2.15rem; margin-bottom: 0.75rem;">
            Your Peer-to-Peer <span>Learning Hub</span>
          </h1>
          <p class="hero-desc" style="margin-bottom: 1.25rem; font-size: 1rem;">
            Teach what you know, master what you love. You have <strong>${activeExchanges.length}</strong> active exchanges and <strong>${pendingIncoming.length}</strong> pending requests awaiting your response.
          </p>
          <div class="hero-actions">
            <button class="btn btn-accent" onclick="state.setView('smart-matches')">
              <span>🎯 View Smart Matches</span>
            </button>
            <button class="btn btn-secondary" style="background: rgba(255,255,255,0.9); border: none;" onclick="state.setView('discovery')">
              <span>🔍 Discover New Partners</span>
            </button>
            <button class="btn btn-ghost" style="color: white; border: 1px solid rgba(255,255,255,0.3);" onclick="state.setView('profile')">
              <span>⚙️ Manage My Skills</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Key Metrics Grid -->
      <section class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background-color: var(--primary-light); color: var(--primary);">
            🎓
          </div>
          <div class="stat-info">
            <div class="stat-value">${stats.teachCount}</div>
            <div class="stat-label">Skills Teaching</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background-color: var(--secondary-light); color: var(--secondary);">
            🎯
          </div>
          <div class="stat-info">
            <div class="stat-value">${stats.learnCount}</div>
            <div class="stat-label">Skills Learning</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background-color: var(--accent-emerald-light); color: var(--accent-emerald);">
            🤝
          </div>
          <div class="stat-info">
            <div class="stat-value">${stats.activeCount}</div>
            <div class="stat-label">Active Exchanges</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background-color: var(--accent-amber-light); color: var(--accent-amber);">
            ⏱️
          </div>
          <div class="stat-info">
            <div class="stat-value">${stats.hoursExchanged}h</div>
            <div class="stat-label">Hours Shared</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background-color: #fdf2f8; color: #db2777;">
            ⭐
          </div>
          <div class="stat-info">
            <div class="stat-value">${stats.communityRating}</div>
            <div class="stat-label">Trust Rating</div>
          </div>
        </div>
      </section>

      <!-- Pending Incoming Requests Section -->
      ${pendingIncoming.length > 0 ? `
        <section style="margin-bottom: 2.5rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
            <h2 style="font-size: 1.35rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem;">
              <span>📬 Incoming Swap Requests</span>
              <span class="badge badge-rose">${pendingIncoming.length} action required</span>
            </h2>
            <button class="btn btn-ghost btn-sm" onclick="state.setView('swaps')">View All Requests →</button>
          </div>

          <div style="display: grid; gap: 1rem;">
            ${pendingIncoming.map(swap => `
              <div class="card" style="border-left: 4px solid var(--accent-amber); display: flex; flex-direction: column; gap: 1rem;">
                <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
                  <div style="display: flex; gap: 0.85rem; align-items: center;">
                    <img src="${escapeHtml(swap.sender.avatar)}" alt="${escapeHtml(swap.sender.name)}" style="width: 46px; height: 46px; border-radius: var(--radius-full); object-fit: cover;" />
                    <div>
                      <h4 style="font-size: 1.05rem; font-weight: 700;">${escapeHtml(swap.sender.name)}</h4>
                      <p style="font-size: 0.8125rem; color: var(--text-muted);">${escapeHtml(swap.sender.title)} • 📍 ${escapeHtml(swap.sender.location)}</p>
                    </div>
                  </div>
                  <span class="badge badge-amber">Awaiting Your Response</span>
                </div>

                <div class="match-exchange-box" style="margin: 0;">
                  <div class="exchange-side">
                    <div class="exchange-label">They will teach you:</div>
                    <div class="exchange-skill-name" style="color: var(--primary);">🎓 ${escapeHtml(swap.offeredSkill)}</div>
                  </div>
                  <div class="exchange-arrow">⇄</div>
                  <div class="exchange-side">
                    <div class="exchange-label">In exchange for:</div>
                    <div class="exchange-skill-name" style="color: var(--accent-emerald);">🎯 ${escapeHtml(swap.requestedSkill)}</div>
                  </div>
                </div>

                <p style="font-size: 0.875rem; background: var(--bg-surface); padding: 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border-light); font-style: italic; color: var(--text-main);">
                  "${escapeHtml(swap.message || 'Would love to exchange skills with you!')}"
                </p>

                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; font-size: 0.8125rem; color: var(--text-muted);">
                  <div>
                    <span><strong>Format:</strong> ${escapeHtml(swap.format)}</span> • 
                    <span><strong>Preferred:</strong> ${escapeHtml(swap.preferredTime)}</span>
                  </div>
                  <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-accent btn-sm" onclick="handleAcceptSwap('${swap.id}')">
                      <span>✓ Accept Swap</span>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="handleRejectSwap('${swap.id}')">
                      <span>✕ Decline</span>
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      ` : ''}

      <!-- Active Ongoing Exchanges Section -->
      <section style="margin-bottom: 2.5rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
          <h2 style="font-size: 1.35rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem;">
            <span>🤝 Active Learning Partnerships</span>
            <span class="badge badge-emerald">${activeExchanges.length} ongoing</span>
          </h2>
          <button class="btn btn-ghost btn-sm" onclick="state.setView('swaps')">Manage All Swaps →</button>
        </div>

        ${activeExchanges.length > 0 ? `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.25rem;">
            ${activeExchanges.map(swap => {
              const partner = swap.senderId === state.user.id ? swap.receiver : swap.sender;
              const youOffer = swap.senderId === state.user.id ? swap.offeredSkill : swap.requestedSkill;
              const theyOffer = swap.senderId === state.user.id ? swap.requestedSkill : swap.offeredSkill;

              return `
                <div class="card" style="border-top: 4px solid var(--accent-emerald);">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                      <img src="${escapeHtml(partner.avatar)}" alt="${escapeHtml(partner.name)}" style="width: 44px; height: 44px; border-radius: var(--radius-full); object-fit: cover;" />
                      <div>
                        <h4 style="font-size: 1rem; font-weight: 700;">${escapeHtml(partner.name)}</h4>
                        <p style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(partner.timezone || 'Flexible')} • ⭐ ${partner.rating || 5.0}</p>
                      </div>
                    </div>
                    <span class="badge badge-emerald">Active Exchange</span>
                  </div>

                  <div class="match-exchange-box" style="margin-bottom: 1rem;">
                    <div class="exchange-side">
                      <div class="exchange-label">You Teach:</div>
                      <div class="exchange-skill-name" style="font-size: 0.875rem;">${escapeHtml(youOffer)}</div>
                    </div>
                    <div class="exchange-arrow" style="font-size: 1.25rem;">⇄</div>
                    <div class="exchange-side">
                      <div class="exchange-label">You Learn:</div>
                      <div class="exchange-skill-name" style="font-size: 0.875rem;">${escapeHtml(theyOffer)}</div>
                    </div>
                  </div>

                  <!-- Session Notes & Coordination -->
                  <div style="background-color: var(--bg-subtle); border-radius: var(--radius-sm); padding: 0.75rem; margin-bottom: 1rem; font-size: 0.8125rem;">
                    <div style="font-weight: 700; color: var(--text-muted); margin-bottom: 0.35rem; display: flex; justify-content: space-between;">
                      <span>📝 Session Notes:</span>
                      <button class="btn btn-ghost btn-sm" style="padding: 0 0.25rem; font-size: 0.75rem;" onclick="promptEditSessionNotes('${swap.id}', '${escapeHtml(swap.notes || '')}')">Edit Notes</button>
                    </div>
                    <p style="color: var(--text-main); line-height: 1.4;">
                      ${escapeHtml(swap.notes || 'No session notes added yet. Click edit to write schedule links or topics.')}
                    </p>
                  </div>

                  <div style="display: flex; gap: 0.75rem;">
                    <button class="btn btn-accent btn-sm" style="flex: 1;" onclick="openCompleteSwapModal('${swap.id}', '${escapeHtml(partner.name)}')">
                      <span>🏁 Complete & Leave Review</span>
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="viewUserProfile('${partner.id}')">
                      <span>Profile</span>
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <div class="empty-state" style="padding: 2rem;">
            <div class="empty-state-icon">💡</div>
            <h3 class="empty-state-title">No active exchanges yet</h3>
            <p class="empty-state-desc">Find someone who wants your skills, or explore smart matches to start your first skill swap!</p>
            <button class="btn btn-primary" onclick="state.setView('smart-matches')">Explore Smart Matches</button>
          </div>
        `}
      </section>

      <!-- Completed Sessions / History -->
      ${recentCompleted.length > 0 ? `
        <section>
          <h2 style="font-size: 1.35rem; font-weight: 700; margin-bottom: 1rem;">🎉 Recently Completed Knowledge Swaps</h2>
          <div style="display: grid; gap: 0.875rem;">
            ${recentCompleted.map(swap => {
              const partner = swap.senderId === state.user.id ? swap.receiver : swap.sender;
              return `
                <div class="card" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; padding: 1rem 1.25rem;">
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <img src="${escapeHtml(partner.avatar)}" alt="${escapeHtml(partner.name)}" style="width: 40px; height: 40px; border-radius: var(--radius-full); object-fit: cover;" />
                    <div>
                      <div style="font-weight: 700; font-size: 0.9375rem;">Swapped with ${escapeHtml(partner.name)}</div>
                      <div style="font-size: 0.8125rem; color: var(--text-muted);">${escapeHtml(swap.offeredSkill)} ⇄ ${escapeHtml(swap.requestedSkill)}</div>
                    </div>
                  </div>
                  <div style="display: flex; align-items: center; gap: 1rem;">
                    ${swap.rating ? `
                      <span class="badge badge-amber" style="font-size: 0.8125rem;">⭐ ${swap.rating} / 5</span>
                    ` : ''}
                    <span class="badge badge-emerald">✓ Completed (+2 hrs)</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </section>
      ` : ''}
    `;
  } catch (err) {
    container.innerHTML = `
      <div class="card" style="border-left: 4px solid var(--accent-rose); padding: 1.5rem;">
        <h3 style="color: var(--accent-rose); font-weight: 700;">Failed to load dashboard</h3>
        <p style="color: var(--text-muted);">${escapeHtml(err.message)}</p>
        <button class="btn btn-secondary btn-sm" style="margin-top: 1rem;" onclick="renderDashboardView(document.getElementById('view-container'))">Try Again</button>
      </div>
    `;
  }
}
