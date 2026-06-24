import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'vi' | 'en';
export type ProviderPref = 'auto' | 'local' | 'ai';

interface SettingsState {
  language: Language;
  preferredProvider: ProviderPref;
  setLanguage: (l: Language) => void;
  setProvider: (p: ProviderPref) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'vi',
      preferredProvider: 'auto',
      setLanguage: (language) => set({ language }),
      setProvider: (preferredProvider) => set({ preferredProvider }),
    }),
    { name: 'edu-settings-v1' },
  ),
);
