import React from 'react';
import { useSettingsStore } from '../stores/settings-store';

export function LanguageToggle() {
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);

  return (
    <div className="inline-flex rounded-full border border-gray-300 overflow-hidden text-sm">
      <button
        aria-pressed={language === 'vi'}
        onClick={() => setLanguage('vi')}
        className={`px-3 py-1 ${language === 'vi' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
      >
        VI
      </button>
      <button
        aria-pressed={language === 'en'}
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 ${language === 'en' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
      >
        EN
      </button>
    </div>
  );
}