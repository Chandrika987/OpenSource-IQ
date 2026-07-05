import { create } from 'zustand';
import { requestApi } from '../services/apiClient';

const STORAGE_KEYS = {
  username: 'github_username',
  avatar: 'github_avatar',
};

const readStoredAuth = () => ({
  username: localStorage.getItem(STORAGE_KEYS.username) || null,
  avatarUrl: localStorage.getItem(STORAGE_KEYS.avatar) || null,
});

export const useAuthStore = create((set) => ({
  ...readStoredAuth(),
  isAuthenticated: Boolean(localStorage.getItem(STORAGE_KEYS.username)),

  connect: ({ username, avatarUrl }) => {
    localStorage.setItem(STORAGE_KEYS.username, username);
    if (avatarUrl) localStorage.setItem(STORAGE_KEYS.avatar, avatarUrl);

    set({
      username,
      avatarUrl: avatarUrl || null,
      isAuthenticated: true,
    });
  },

  signOut: async () => {
    try {
      await requestApi('/api/auth/logout', { method: 'POST' });
    } catch {
      // Local sign-out should still proceed if the server session already expired.
    }

    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    set({
      username: null,
      avatarUrl: null,
      isAuthenticated: false,
    });
  },
}));

export const getAuthUsername = () => localStorage.getItem(STORAGE_KEYS.username);
