// Swap Requests Management View for SkillSwap

let currentSwapsTab = 'incoming';

async function renderSwapsView(container) {
  if (!state.user) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📬</div>
        <h2 class="empty-state-title">Sign in to manage your skill swap requests</h2>
        <p class="empty-state-desc">Accept incoming proposals, coordinate video sessions, and record completed knowledge exchanges.</p>
        <button class="btn btn-primary" onclick="openAuthModal('login')">Sign In</button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="text-align: center; padding: 3rem;">
      <div style="font-size: 2rem; margin-bottom: 0.5rem;">⏳</div>
      <p style="color: var(--text-muted);">Loading your skill swap requests...</p>
    </div>
  `;

  try {
    const data = await api.getSwaps();
    const summary = data.summary;
    const incoming = data.incomingPending || [];
    const outgoing = data.outgoingPending || [];
    const active = data.active || [];
    const completed = data.completed || [];
    const past = data.past || [];

    // Header
    container.innerHTML = `
      <div class="view-header">
        <div class="view-title-row">
          <div>
            <h1 class="view-title">Skill Swap Management</h1>
            <p class="view-subtitle">Review proposals, coordinate active sessions, and track completed knowledge exchanges.</p>
          </div>
          <button class="btn btn-primary" onclick="state.setView('discovery')">
            <span>+ Propose New Swap</span>
          </button>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <nav class="tabs-nav" role="tablist">
        <button class="tab-btn ${currentSwapsTab === 'incoming' ? 'active' : ''}" onclick="switchSwapsTab('incoming')">
          <span>📬 Incoming Requests</span>
          <span class="tab-badge">${incoming.length}</span>
        </button>
        <button class="tab-btn ${currentSwapsTab === 'active' ? 'active' : ''}" onclick="switchSwapsTab('active')">
          <span>🤝 Active Exchanges</span>
          <span class="tab-badge">${active.length}</span>
        </button>
        <button class="tab-btn ${currentSwapsTab === 'outgoing' ? 'active' : ''}" onclick="switchSwapsTab('outgoing')">
          <span>📤 Outgoing Sent</span>
          <span class="tab-badge">${outgoing.length}</span>
        </button>
        <button class="tab-btn ${currentSwapsTab === 'completed' ? 'active' : ''}" onclick="switchSwapsTab('completed')">
          <span>🏆 Completed</span>
          <span class="tab-badge">${completed.length}</span>
        </button>
        <button class="tab-btn ${currentSwapsTab === 'past' ? 'active' : ''}" onclick="switchSwapsTab('past')">
          <span>📁 Archive</span>
          <span class="tab-badge">${past.length}</span>
        </button>
      </nav>

      <!-- Tab Content Area -->
      <div id="swaps-tab-content"></div>
    `;

    renderActiveSwapsTabContent({
      incoming,
      outgoing,
      active,
      completed,
      past
    });

  } catch (err) {
    container.innerHTML = `
      <div class="card" style="border-left: 4px solid var(--accent-rose); padding: 1.5rem;">
        <h3 style="color: var(--accent-rose); font-weight: 700;">Failed to load swaps</h3>
        <p style="color: var(--text-muted);">${escapeHtml(err.message)}</p>
      </div>
    `;
  }
}

function switchSwapsTab(tabName) {
  currentSwapsTab = tabName;
  renderSwapsView(document.getElementById('view-container'));
}

function renderActiveSwapsTabContent(data) {
  const contentEl = document.getElementById('swaps-tab-content');
  if (!contentEl) return;

  switch (currentSwapsTab) {
    case 'incoming':
      renderIncomingTab(contentEl, data.incoming);
      break;
    case 'active':
      renderActiveTab(contentEl, data.active);
      break;
    case 'outgoing':
      renderOutgoingTab(contentEl, data.outgoing);
      break;
    case 'completed':
      renderCompletedTab(contentEl, data.completed);
      break;
    case 'past':
      renderPastTab(contentEl, data.past);
      break;
  }
}

function renderIncomingTab(el, list) {
  if (list.length === 0) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📬</div>
        <h3 class="empty-state-title">No pending incoming requests</h3>
        <p class="empty-state-desc">When other members request to learn from you, their proposals will appear here for your review.</p>
      </div>
    `;
    return;
  }

  el.innerHTML = `
    <div style="display: grid; gap: 1.25rem;">
      ${list.map(swap => `
        <div class="card" style="border-left: 4px solid var(--accent-amber);">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
            <div style="display: flex; gap: 0.85rem; align-items: center;">
              <img src="${escapeHtml(swap.sender.avatar)}" alt="${escapeHtml(swap.sender.name)}" style="width: 48px; height: 48px; border-radius: var(--radius-full); object-fit: cover;" />
              <div>
                <h3 style="font-size: 1.1rem; font-weight: 700;">${escapeHtml(swap.sender.name)}</h3>
                <p style="font-size: 0.8125rem; color: var(--text-muted);">${escapeHtml(swap.sender.title)} • 📍 ${escapeHtml(swap.sender.location)}</p>
              </div>
            </div>
            <span class="badge badge-amber">Action Required</span>
          </div>

          <div class="match-exchange-box">
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

          <div style="background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 0.875rem; margin-bottom: 1rem; font-size: 0.875rem;">
            <div style="font-weight: 600; color: var(--text-muted); margin-bottom: 0.25rem;">Proposal Message:</div>
            <p style="color: var(--text-main); font-style: italic;">"${escapeHtml(swap.message)}"</p>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; font-size: 0.8125rem; color: var(--text-muted);">
            <div>
              <span><strong>Session Format:</strong> ${escapeHtml(swap.format)}</span> • 
              <span><strong>Availability:</strong> ${escapeHtml(swap.preferredTime)}</span> • 
              <span><strong>Proposed:</strong> ${new Date(swap.createdAt).toLocaleDateString()}</span>
            </div>
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-accent btn-sm" onclick="handleAcceptSwap('${swap.id}')">
                <span>✓ Accept Swap</span>
              </button>
              <button class="btn btn-danger btn-sm" onclick="handleRejectSwap('${swap.id}')">
                <span>✕ Decline</span>
              </button>
              <button class="btn btn-secondary btn-sm" onclick="viewUserProfile('${swap.sender.id}')">
                <span>Profile</span>
              </button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderActiveTab(el, list) {
  if (list.length === 0) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🤝</div>
        <h3 class="empty-state-title">No active exchanges right now</h3>
        <p class="empty-state-desc">Accepted skill exchanges will appear here. You can record session notes, video call links, and complete sessions.</p>
        <button class="btn btn-primary" onclick="state.setView('smart-matches')">Explore Smart Matches</button>
      </div>
    `;
    return;
  }

  el.innerHTML = `
    <div style="display: grid; gap: 1.25rem;">
      ${list.map(swap => {
        const partner = swap.senderId === state.user.id ? swap.receiver : swap.sender;
        const youTeach = swap.senderId === state.user.id ? swap.offeredSkill : swap.requestedSkill;
        const theyTeach = swap.senderId === state.user.id ? swap.requestedSkill : swap.offeredSkill;

        return `
          <div class="card" style="border-left: 4px solid var(--accent-emerald);">
            <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
              <div style="display: flex; gap: 0.85rem; align-items: center;">
                <img src="${escapeHtml(partner.avatar)}" alt="${escapeHtml(partner.name)}" style="width: 50px; height: 50px; border-radius: var(--radius-full); object-fit: cover;" />
                <div>
                  <h3 style="font-size: 1.15rem; font-weight: 700;">Partner: ${escapeHtml(partner.name)}</h3>
                  <p style="font-size: 0.8125rem; color: var(--text-muted);">${escapeHtml(partner.title)} • 📍 ${escapeHtml(partner.location)}</p>
                </div>
              </div>
              <span class="badge badge-emerald">Active Exchange</span>
            </div>

            <div class="match-exchange-box">
              <div class="exchange-side">
                <div class="exchange-label">You Teach:</div>
                <div class="exchange-skill-name" style="color: var(--primary);">🎓 ${escapeHtml(youTeach)}</div>
              </div>
              <div class="exchange-arrow">⇄</div>
              <div class="exchange-side">
                <div class="exchange-label">They Teach:</div>
                <div class="exchange-skill-name" style="color: var(--accent-emerald);">🎯 ${escapeHtml(theyTeach)}</div>
              </div>
            </div>

            <!-- Session Notes Card -->
            <div style="background-color: var(--bg-subtle); border-radius: var(--radius-sm); padding: 1rem; margin-bottom: 1.25rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <span style="font-size: 0.8125rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
                  📝 Coordination & Meeting Notes
                </span>
                <button class="btn btn-ghost btn-sm" onclick="promptEditSessionNotes('${swap.id}', '${escapeHtml(swap.notes || '')}')">
                  Edit Notes
                </button>
              </div>
              <p style="font-size: 0.875rem; color: var(--text-main); white-space: pre-wrap; line-height: 1.5;">
                ${escapeHtml(swap.notes || 'No session notes added yet. Click edit to record Google Meet / Zoom links or planned learning topics.')}
              </p>
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
              <div style="font-size: 0.8125rem; color: var(--text-muted);">
                <span>Accepted on ${swap.acceptedAt ? new Date(swap.acceptedAt).toLocaleDateString() : 'recently'}</span>
              </div>
              <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-accent btn-sm" onclick="openCompleteSwapModal('${swap.id}', '${escapeHtml(partner.name)}')">
                  <span>🏁 Mark Completed & Review</span>
                </button>
                <button class="btn btn-danger btn-sm" onclick="handleCancelSwap('${swap.id}')">
                  <span>Cancel Exchange</span>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderOutgoingTab(el, list) {
  if (list.length === 0) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📤</div>
        <h3 class="empty-state-title">No outgoing proposals waiting</h3>
        <p class="empty-state-desc">You haven’t sent any pending swap requests. Explore members or smart matches to propose an exchange!</p>
        <button class="btn btn-primary" onclick="state.setView('discovery')">Browse Members</button>
      </div>
    `;
    return;
  }

  el.innerHTML = `
    <div style="display: grid; gap: 1.25rem;">
      ${list.map(swap => `
        <div class="card">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
            <div style="display: flex; gap: 0.85rem; align-items: center;">
              <img src="${escapeHtml(swap.receiver.avatar)}" alt="${escapeHtml(swap.receiver.name)}" style="width: 48px; height: 48px; border-radius: var(--radius-full); object-fit: cover;" />
              <div>
                <h3 style="font-size: 1.1rem; font-weight: 700;">Sent to ${escapeHtml(swap.receiver.name)}</h3>
                <p style="font-size: 0.8125rem; color: var(--text-muted);">${escapeHtml(swap.receiver.title)}</p>
              </div>
            </div>
            <span class="badge badge-amber">Waiting for Partner</span>
          </div>

          <div class="match-exchange-box">
            <div class="exchange-side">
              <div class="exchange-label">You offered:</div>
              <div class="exchange-skill-name">🎓 ${escapeHtml(swap.offeredSkill)}</div>
            </div>
            <div class="exchange-arrow">⇄</div>
            <div class="exchange-side">
              <div class="exchange-label">You requested:</div>
              <div class="exchange-skill-name">🎯 ${escapeHtml(swap.requestedSkill)}</div>
            </div>
          </div>

          <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1rem; font-style: italic;">
            "${escapeHtml(swap.message)}"
          </p>

          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
            <span style="font-size: 0.8125rem; color: var(--text-light);">Sent on ${new Date(swap.createdAt).toLocaleDateString()}</span>
            <button class="btn btn-ghost btn-sm" style="color: var(--accent-rose);" onclick="handleCancelSwap('${swap.id}')">
              <span>Withdraw Proposal</span>
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderCompletedTab(el, list) {
  if (list.length === 0) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🏆</div>
        <h3 class="empty-state-title">No completed exchanges yet</h3>
        <p class="empty-state-desc">Once you complete sessions and leave feedback, your knowledge milestones will be celebrated here.</p>
      </div>
    `;
    return;
  }

  el.innerHTML = `
    <div style="display: grid; gap: 1.25rem;">
      ${list.map(swap => {
        const partner = swap.senderId === state.user.id ? swap.receiver : swap.sender;
        return `
          <div class="card" style="border-left: 4px solid var(--primary);">
            <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 0.75rem;">
              <div style="display: flex; gap: 0.85rem; align-items: center;">
                <img src="${escapeHtml(partner.avatar)}" alt="${escapeHtml(partner.name)}" style="width: 44px; height: 44px; border-radius: var(--radius-full); object-fit: cover;" />
                <div>
                  <h4 style="font-size: 1.05rem; font-weight: 700;">Completed with ${escapeHtml(partner.name)}</h4>
                  <p style="font-size: 0.8125rem; color: var(--text-muted);">${escapeHtml(swap.offeredSkill)} ⇄ ${escapeHtml(swap.requestedSkill)}</p>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                ${swap.rating ? `<span class="badge badge-amber">⭐ ${swap.rating} / 5</span>` : ''}
                <span class="badge badge-emerald">✓ Completed</span>
              </div>
            </div>

            ${swap.review ? `
              <div style="background-color: var(--bg-subtle); padding: 0.75rem; border-radius: var(--radius-sm); font-size: 0.875rem; color: var(--text-main); margin-bottom: 0.5rem; font-style: italic;">
                "${escapeHtml(swap.review)}"
              </div>
            ` : ''}

            <div style="font-size: 0.75rem; color: var(--text-light);">
              Finished on ${swap.completedAt ? new Date(swap.completedAt).toLocaleDateString() : 'N/A'} • +2 hours added to learning profile
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderPastTab(el, list) {
  if (list.length === 0) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📁</div>
        <h3 class="empty-state-title">Archive is clear</h3>
        <p class="empty-state-desc">No declined or cancelled requests in your history.</p>
      </div>
    `;
    return;
  }

  el.innerHTML = `
    <div style="display: grid; gap: 1rem;">
      ${list.map(swap => {
        const partner = swap.senderId === state.user.id ? swap.receiver : swap.sender;
        return `
          <div class="card" style="opacity: 0.75;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="font-weight: 600;">${escapeHtml(partner.name)}</span>
                <span style="font-size: 0.8125rem; color: var(--text-muted);"> (${escapeHtml(swap.offeredSkill)} for ${escapeHtml(swap.requestedSkill)})</span>
              </div>
              <span class="badge badge-gray">${escapeHtml(swap.status.toUpperCase())}</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}
