// Skill Discovery View for SkillSwap

let discoveryState = {
  query: '',
  category: 'All',
  type: 'all',
  proficiency: 'All'
};

async function renderDiscoveryView(container) {
  container.innerHTML = `
    <!-- Discovery Header & Search Bar -->
    <div class="view-header">
      <div class="view-title-row">
        <div>
          <h1 class="view-title">Explore Skills & Learning Partners</h1>
          <p class="view-subtitle">Connect with talented individuals willing to teach what they love in exchange for your unique knowledge.</p>
        </div>
        ${!state.user ? `
          <button class="btn btn-primary" onclick="openAuthModal('login')">
            <span>🚀 Join SkillSwap Free</span>
          </button>
        ` : ''}
      </div>
    </div>

    <!-- Main Layout with Filter Sidebar and Partners Grid -->
    <div class="discovery-layout">
      <!-- Sidebar Filters -->
      <aside class="discovery-sidebar">
        <h3 style="font-size: 1.125rem; font-weight: 700; margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: space-between;">
          <span>🔍 Filters</span>
          <button class="btn btn-ghost btn-sm" onclick="resetDiscoveryFilters()">Reset</button>
        </h3>

        <!-- Search Input -->
        <div class="form-group">
          <label class="form-label" for="discovery-search-input">Search Skills or People</label>
          <input 
            type="text" 
            id="discovery-search-input" 
            class="form-control" 
            placeholder="e.g. React, Spanish, Figma, Python..." 
            value="${escapeHtml(discoveryState.query)}"
          />
        </div>

        <!-- Category Filter -->
        <div class="form-group">
          <label class="form-label">Category</label>
          <div style="display: flex; flex-direction: column; gap: 0.35rem; max-height: 230px; overflow-y: auto; padding-right: 0.25rem;">
            ${['All', 'Development', 'Design', 'Languages', 'Data Science', 'Music', 'Photography', 'Marketing', 'Business', 'Writing'].map(cat => `
              <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; cursor: pointer; padding: 0.25rem 0.5rem; border-radius: var(--radius-xs); ${discoveryState.category === cat ? 'background-color: var(--primary-light); color: var(--primary); font-weight: 700;' : ''}">
                <input type="radio" name="disc-cat" value="${cat}" ${discoveryState.category === cat ? 'checked' : ''} onchange="handleCategoryFilterChange('${cat}')" />
                <span>${cat}</span>
              </label>
            `).join('')}
          </div>
        </div>

        <!-- Proficiency Filter -->
        <div class="form-group">
          <label class="form-label">Proficiency Level</label>
          <select id="discovery-prof-select" class="form-control" onchange="handleProficiencyFilterChange(this.value)">
            <option value="All" ${discoveryState.proficiency === 'All' ? 'selected' : ''}>All Proficiency Levels</option>
            <option value="Beginner" ${discoveryState.proficiency === 'Beginner' ? 'selected' : ''}>Beginner</option>
            <option value="Intermediate" ${discoveryState.proficiency === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
            <option value="Advanced" ${discoveryState.proficiency === 'Advanced' ? 'selected' : ''}>Advanced</option>
            <option value="Expert" ${discoveryState.proficiency === 'Expert' ? 'selected' : ''}>Expert</option>
          </select>
        </div>

        <!-- Type Filter -->
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">Skill Type</label>
          <select id="discovery-type-select" class="form-control" onchange="handleTypeFilterChange(this.value)">
            <option value="all" ${discoveryState.type === 'all' ? 'selected' : ''}>Both Teaching & Learning</option>
            <option value="teach" ${discoveryState.type === 'teach' ? 'selected' : ''}>Members who Teach</option>
            <option value="learn" ${discoveryState.type === 'learn' ? 'selected' : ''}>Members seeking to Learn</option>
          </select>
        </div>
      </aside>

      <!-- Main Results Column -->
      <section>
        <!-- Category Quick Pills Bar -->
        <div style="display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.75rem; margin-bottom: 1.25rem;">
          ${['All', 'Development', 'Design', 'Languages', 'Data Science', 'Music', 'Photography', 'Marketing'].map(cat => `
            <button class="cat-pill ${discoveryState.category === cat ? 'active' : ''}" onclick="handleCategoryFilterChange('${cat}')">
              ${cat}
            </button>
          `).join('')}
        </div>

        <div id="discovery-results-container">
          <div style="text-align: center; padding: 3rem;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">⏳</div>
            <p style="color: var(--text-muted);">Finding compatible skill partners...</p>
          </div>
        </div>
      </section>
    </div>
  `;

  // Attach search debounce
  const searchInput = document.getElementById('discovery-search-input');
  let timeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      discoveryState.query = e.target.value;
      fetchAndRenderPartners();
    }, 300);
  });

  fetchAndRenderPartners();
}

async function fetchAndRenderPartners() {
  const container = document.getElementById('discovery-results-container');
  if (!container) return;

  try {
    const data = await api.getDiscovery({
      query: discoveryState.query,
      category: discoveryState.category,
      type: discoveryState.type,
      proficiency: discoveryState.proficiency
    });

    const partners = data.partners || [];

    if (partners.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <h3 class="empty-state-title">No matching skill partners found</h3>
          <p class="empty-state-desc">Try clearing filters or searching for another topic like "React", "Spanish", "Figma", or "Guitar".</p>
          <button class="btn btn-secondary" onclick="resetDiscoveryFilters()">Clear All Filters</button>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
        <div style="font-size: 0.875rem; color: var(--text-muted); font-weight: 600;">
          Showing <strong>${partners.length}</strong> available learning partners
        </div>
        ${state.user ? `
          <div style="font-size: 0.8125rem; color: var(--accent-emerald); font-weight: 700; display: flex; align-items: center; gap: 0.35rem;">
            <span>✨ Sorted by compatibility with your profile</span>
          </div>
        ` : ''}
      </div>

      <div class="partners-grid">
        ${partners.map(p => renderPartnerCard(p, state.user)).join('')}
      </div>
    `;
  } catch (err) {
    container.innerHTML = `
      <div class="card" style="border-left: 4px solid var(--accent-rose); padding: 1.5rem;">
        <h3 style="color: var(--accent-rose); font-weight: 700;">Error searching partners</h3>
        <p style="color: var(--text-muted);">${escapeHtml(err.message)}</p>
      </div>
    `;
  }
}

function handleCategoryFilterChange(cat) {
  discoveryState.category = cat;
  renderDiscoveryView(document.getElementById('view-container'));
}

function handleProficiencyFilterChange(prof) {
  discoveryState.proficiency = prof;
  fetchAndRenderPartners();
}

function handleTypeFilterChange(type) {
  discoveryState.type = type;
  fetchAndRenderPartners();
}

function resetDiscoveryFilters() {
  discoveryState = {
    query: '',
    category: 'All',
    type: 'all',
    proficiency: 'All'
  };
  renderDiscoveryView(document.getElementById('view-container'));
}
