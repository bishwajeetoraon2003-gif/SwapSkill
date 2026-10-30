class AppState {
  constructor() {
    this.user = null;
    this.teachSkills = [];
    this.learnSkills = [];
    this.stats = null;
    this.currentView = 'discovery'; // 'dashboard' | 'discovery' | 'smart-matches' | 'swaps' | 'profile'
    this.listeners = [];
    this.pendingSwapPartner = null;
    this.categories = [];
  }

  setUser(userData) {
    if (userData) {
      this.user = userData.user;
      this.teachSkills = userData.teachSkills || [];
      this.learnSkills = userData.learnSkills || [];
      this.stats = userData.stats || null;
    } else {
      this.user = null;
      this.teachSkills = [];
      this.learnSkills = [];
      this.stats = null;
    }
    this.notify('user');
  }

  setView(viewName) {
    this.currentView = viewName;
    window.location.hash = viewName;
    this.notify('view');
  }

  setPendingSwap(partner, suggestedOffer = '', suggestedRequest = '') {
    this.pendingSwapPartner = {
      partner,
      suggestedOffer,
      suggestedRequest
    };
    this.notify('pendingSwap');
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(event) {
    for (const listener of this.listeners) {
      try {
        listener(event, this);
      } catch (err) {
        console.error('State listener error:', err);
      }
    }
  }
}

const state = new AppState();
