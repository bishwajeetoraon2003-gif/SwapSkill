// Smart Matching View for SkillSwap

async function renderSmartMatchView(container) {
  if (!state.user) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🎯</div>
        <h2 class="empty-state-title">Sign in to unlock Smart Matching</h2>
        <p class="empty-state-desc">SkillSwap’s smart algorithm automatically matches your teaching skills with people who want them, while finding members who teach exactly what you want to learn.</p>
        <button class="btn btn-primary" onclick="openAuthModal('login')">Sign In to View Matches</button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="text-align: center; padding: 3rem;">
      <div style="font-size: 2rem; margin-bottom: 0.5rem;">🧠</div>
      <p style="color: var(--text-muted);">Running Smart Matching algorithm across community preferences...</p>
    </div>
  `;

  try {
    const data = await api.getSmartMatches();
    const reciprocal = data.reciprocalMatches || [];
    const highPotential = data.highPotentialMatches || [];

    container.innerHTML = `
      <!-- Smart Match Intro Banner -->
      <section class="match-spotlight-banner">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(255,255,255,0.2); padding: 0.25rem 0.75rem; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 700; margin-bottom: 0.5rem;">
              <span>🤖 Algorithmic Reciprocal Match Engine</span>
            </div>
            <h1 style="font-size: 1.85rem; font-weight: 800; line-height: 1.2;">
              Complementary Skill Partners Found for You
            </h1>
            <p style="font-size: 0.9375rem; opacity: 0.9; margin-top: 0.35rem; max-width: 650px;">
              We cross-referenced your <strong>${state.teachSkills.length} teaching skills</strong> and <strong>${state.learnSkills.length} learning goals</strong> to find your highest-affinity swap partners.
            </p>
          </div>
          <div style="background: rgba(0,0,0,0.25); border-radius: var(--radius-md); padding: 1rem 1.5rem; text-align: center; backdrop-filter: blur(8px);">
            <div style="font-size: 2.25rem; font-weight: 800; color: #a7f3d0; line-height: 1;">
              ${reciprocal.length}
            </div>
            <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 0.25rem;">
              100% Mutual Matches
            </div>
          </div>
        </div>
      </section>

      <!-- Section 1: Perfect 1:1 Reciprocal Mutual Matches -->
      <section style="margin-bottom: 3rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem;">
          <div>
            <h2 style="font-size: 1.4rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem; color: var(--text-main);">
              <span>🔄 100% Mutual Reciprocal Matches</span>
              <span class="badge badge-emerald">Ideal Win-Win</span>
            </h2>
            <p style="font-size: 0.875rem; color: var(--text-muted); margin-top: 0.2rem;">
              Both partners teach what the other wants to learn — direct, zero-friction exchange!
            </p>
          </div>
        </div>

        ${reciprocal.length > 0 ? `
          <div class="match-matrix-grid">
            ${reciprocal.map(m => `
              <div class="card card-interactive match-card" style="box-shadow: 0 4px 15px rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.3);">
                <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1rem;">
                  <div style="display: flex; gap: 0.75rem; align-items: center;">
                    <img src="${escapeHtml(m.user.avatar)}" alt="${escapeHtml(m.user.name)}" style="width: 52px; height: 52px; border-radius: var(--radius-md); object-fit: cover;" />
                    <div>
                      <h3 style="font-size: 1.15rem; font-weight: 700;">${escapeHtml(m.user.name)}</h3>
                      <p style="font-size: 0.8125rem; color: var(--text-muted);">${escapeHtml(m.user.title)}</p>
                      <div style="font-size: 0.75rem; color: var(--text-light); margin-top: 0.15rem;">
                        📍 ${escapeHtml(m.user.location)} • ⭐ ${m.user.rating || 5.0}
                      </div>
                    </div>
                  </div>
                  <div class="match-pill-reciprocal">
                    <span>${m.score}% Match</span>
                  </div>
                </div>

                <!-- Complementary Exchange Showcase -->
                <div class="match-exchange-box">
                  <div class="exchange-side">
                    <div class="exchange-label" style="color: var(--primary);">You Teach:</div>
                    <div class="exchange-skill-name">${escapeHtml(m.suggestedOffer)}</div>
                  </div>
                  <div class="exchange-arrow">⇄</div>
                  <div class="exchange-side">
                    <div class="exchange-label" style="color: var(--accent-emerald);">They Teach:</div>
                    <div class="exchange-skill-name">${escapeHtml(m.suggestedRequest)}</div>
                  </div>
                </div>

                <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1.25rem; line-height: 1.4;">
                  💡 <strong>Why this matches:</strong> ${escapeHtml(m.reason)}
                </p>

                <div style="display: flex; gap: 0.75rem;">
                  <button class="btn btn-accent" style="flex: 1;" onclick="openSwapModalWithPrepop('${m.user.id}', '${escapeHtml(m.suggestedOffer)}', '${escapeHtml(m.suggestedRequest)}')">
                    <span>⚡ Propose Immediate Swap</span>
                  </button>
                  <button class="btn btn-secondary" onclick="viewUserProfile('${m.user.id}')">
                    <span>Profile</span>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="empty-state" style="padding: 2.5rem;">
            <div class="empty-state-icon">🔄</div>
            <h3 class="empty-state-title">No 100% reciprocal matches yet</h3>
            <p class="empty-state-desc">Add more skills you want to learn or teach in your profile to trigger instant mutual matches!</p>
            <button class="btn btn-primary" onclick="state.setView('profile')">Add Skills to Profile</button>
          </div>
        `}
      </section>

      <!-- Section 2: High Potential Mentor & Partner Matches -->
      <section>
        <div style="margin-bottom: 1.25rem;">
          <h2 style="font-size: 1.4rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem; color: var(--text-main);">
            <span>🌟 High Potential Knowledge Partners</span>
            <span class="badge badge-primary">${highPotential.length} matches</span>
          </h2>
          <p style="font-size: 0.875rem; color: var(--text-muted); margin-top: 0.2rem;">
            Members who either teach one of your wishlist skills or are eagerly looking for your expertise.
          </p>
        </div>

        ${highPotential.length > 0 ? `
          <div class="match-matrix-grid">
            ${highPotential.map(m => `
              <div class="card card-interactive">
                <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1rem;">
                  <div style="display: flex; gap: 0.75rem; align-items: center;">
                    <img src="${escapeHtml(m.user.avatar)}" alt="${escapeHtml(m.user.name)}" style="width: 48px; height: 48px; border-radius: var(--radius-md); object-fit: cover;" />
                    <div>
                      <h4 style="font-size: 1.05rem; font-weight: 700;">${escapeHtml(m.user.name)}</h4>
                      <p style="font-size: 0.8125rem; color: var(--text-muted);">${escapeHtml(m.user.title)}</p>
                    </div>
                  </div>
                  <div class="match-meter high">
                    <span>${m.score}%</span>
                  </div>
                </div>

                <div style="background-color: var(--bg-subtle); padding: 0.75rem; border-radius: var(--radius-sm); margin-bottom: 1rem; font-size: 0.875rem;">
                  <span class="badge ${m.matchType === 'can_teach_you' ? 'badge-primary' : 'badge-amber'}" style="margin-bottom: 0.35rem;">
                    ${m.title}
                  </span>
                  <p style="color: var(--text-main); margin-top: 0.35rem;">${escapeHtml(m.reason)}</p>
                </div>

                <div style="display: flex; gap: 0.75rem; margin-top: auto;">
                  <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="openSwapModalWithPrepop('${m.user.id}', '${escapeHtml(m.suggestedOffer)}', '${escapeHtml(m.suggestedRequest)}')">
                    <span>🤝 Propose Skill Swap</span>
                  </button>
                  <button class="btn btn-secondary btn-sm" onclick="viewUserProfile('${m.user.id}')">
                    <span>View</span>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="empty-state" style="padding: 2rem;">
            <p class="empty-state-desc">Explore the general Discovery tab to browse all community members!</p>
            <button class="btn btn-secondary" onclick="state.setView('discovery')">Browse All Skills</button>
          </div>
        `}
      </section>
    `;
  } catch (err) {
    container.innerHTML = `
      <div class="card" style="border-left: 4px solid var(--accent-rose); padding: 1.5rem;">
        <h3 style="color: var(--accent-rose); font-weight: 700;">Smart Match Calculation Error</h3>
        <p style="color: var(--text-muted);">${escapeHtml(err.message)}</p>
      </div>
    `;
  }
}
