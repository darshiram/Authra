import { create } from 'zustand';

export const useAdminStore = create((set) => ({
  admin: null,
  accessToken: null,
  setAdmin: (admin, token) => set({ admin, accessToken: token }),
  logout: () => set({ admin: null, accessToken: null }),
}));

export const useAdminUIStore = create((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
