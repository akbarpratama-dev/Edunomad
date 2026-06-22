import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  modals: Record<string, boolean>;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  openModal: (key: string) => void;
  closeModal: (key: string) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  modals: {},
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  openModal: (key) => set((state) => ({ modals: { ...state.modals, [key]: true } })),
  closeModal: (key) => set((state) => ({ modals: { ...state.modals, [key]: false } })),
}));
