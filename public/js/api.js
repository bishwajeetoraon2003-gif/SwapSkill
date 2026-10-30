const API_BASE = '/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('skillswap_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('skillswap_token', token);
    } else {
      localStorage.removeItem('skillswap_token');
    }
  }

  getToken() {
    return this.token;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (err) {
      console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, err);
      throw err;
    }
  }

  // Auth Endpoints
  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    this.setToken(data.token);
    return data;
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setToken(data.token);
    return data;
  }

  async demoLogin(userId) {
    const data = await this.request('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
    this.setToken(data.token);
    return data;
  }

  async getDemoUsers() {
    return this.request('/auth/demo-users');
  }

  async getMe() {
    if (!this.token) return null;
    return this.request('/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // User Profile
  async getUserProfile(userId) {
    return this.request(`/users/${userId}`);
  }

  async updateProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  // Skills
  async getCategories() {
    return this.request('/skills/categories');
  }

  async addTeachSkill(skillData) {
    return this.request('/skills/teach', {
      method: 'POST',
      body: JSON.stringify(skillData)
    });
  }

  async updateTeachSkill(id, skillData) {
    return this.request(`/skills/teach/${id}`, {
      method: 'PUT',
      body: JSON.stringify(skillData)
    });
  }

  async deleteTeachSkill(id) {
    return this.request(`/skills/teach/${id}`, {
      method: 'DELETE'
    });
  }

  async addLearnSkill(skillData) {
    return this.request('/skills/learn', {
      method: 'POST',
      body: JSON.stringify(skillData)
    });
  }

  async updateLearnSkill(id, skillData) {
    return this.request(`/skills/learn/${id}`, {
      method: 'PUT',
      body: JSON.stringify(skillData)
    });
  }

  async deleteLearnSkill(id) {
    return this.request(`/skills/learn/${id}`, {
      method: 'DELETE'
    });
  }

  // Discovery & Smart Matches
  async getDiscovery(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/discovery?${query}`);
  }

  async getSmartMatches() {
    return this.request('/matches');
  }

  // Swaps
  async getSwaps() {
    return this.request('/swaps');
  }

  async createSwap(swapData) {
    return this.request('/swaps', {
      method: 'POST',
      body: JSON.stringify(swapData)
    });
  }

  async updateSwapStatus(id, status, extra = {}) {
    return this.request(`/swaps/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, ...extra })
    });
  }

  async updateSwapNotes(id, notes) {
    return this.request(`/swaps/${id}/notes`, {
      method: 'PUT',
      body: JSON.stringify({ notes })
    });
  }

  // Dashboard
  async getDashboard() {
    return this.request('/dashboard');
  }
}

const api = new ApiClient();
