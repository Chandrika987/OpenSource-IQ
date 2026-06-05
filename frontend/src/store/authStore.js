import { create } from 'zustand';

const STORAGE_KEYS = {
  username: 'github_username',
  avatar: 'github_avatar',
  token: 'auth_token',
};

const readStoredAuth = () => ({
  username: localStorage.getItem(STORAGE_KEYS.username) || null,
  avatarUrl: localStorage.getItem(STORAGE_KEYS.avatar) || null,
  token: localStorage.getItem(STORAGE_KEYS.token) || null,
});

export const useAuthStore = create((set) => ({
  ...readStoredAuth(),
  isAuthenticated: Boolean(localStorage.getItem(STORAGE_KEYS.username)),

  connect: ({ username, avatarUrl, token }) => {
    localStorage.setItem(STORAGE_KEYS.username, username);
    if (avatarUrl) localStorage.setItem(STORAGE_KEYS.avatar, avatarUrl);
    if (token) localStorage.setItem(STORAGE_KEYS.token, token);

    set({
      username,
      avatarUrl: avatarUrl || null,
      token: token || null,
      isAuthenticated: true,
    });
  },

  signOut: () => {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    set({
      username: null,
      avatarUrl: null,
      token: null,
      isAuthenticated: false,
    });
  },
}));

export const getAuthUsername = () => localStorage.getItem(STORAGE_KEYS.username);
