import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

export function PageHeader({ title, onBack, right }: Props) {
  const nav = useNavigate();
  const showBack = Boolean(onBack);
  const handleBack = onBack ?? (() => nav(-1));
  return (
    <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3 bg-white">
      {showBack ? (
        <button
          onClick={handleBack}
          className="text-sm text-gray-600 no-underline w-16 text-left"
          aria-label="Back"
        >
          ← Quay lại
        </button>
      ) : (
        <div className="w-16" />
      )}
      <h1 className="text-lg font-bold flex-1 text-center">{title}</h1>
      <div className="w-16 text-right">{right}</div>
    </header>
  );
}