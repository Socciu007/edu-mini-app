import React, { useEffect, useRef, useState } from 'react';
import MenuIcon from '@/static/icons/menu.svg?react';
import { useTranslation } from '../../i18n/use-translation';
import { useChatStore } from '../../stores/chat-store';

interface MenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
}

function MenuItem({ children, onClick }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-2 text-sm text-text hover:bg-card flex items-center gap-2"
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="h-px bg-border my-1" />;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 pt-2 pb-1 text-[10px] uppercase tracking-wide text-text-subtle font-semibold">
      {children}
    </div>
  );
}

export function ChatMenu() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const messages = useChatStore((s) => s.messages);
  const reset = useChatStore((s) => s.reset);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  const firstUserMessage = messages.find((m) => m.role === 'user');
  const sessionLabel = firstUserMessage
    ? firstUserMessage.content.slice(0, 40) + (firstUserMessage.content.length > 40 ? '…' : '')
    : t('chat.menuCurrentSession');

  const handleNewChat = () => {
    reset();
    setOpen(false);
  };

  const handleSearch = () => {
    setOpen(false);
  };

  const handleRefresh = () => {
    reset();
    setOpen(false);
  };

  const handleSessionClick = () => {
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label={t('chat.menu')}
        className="w-9 h-9 flex items-center justify-center rounded-lg text-text-secondary hover:bg-card"
      >
        <MenuIcon className="w-5 h-5" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-surface border border-border rounded-xl shadow-lg overflow-hidden z-30">
          <MenuItem onClick={handleNewChat}>
            <span>＋</span>
            <span>{t('chat.menuNew')}</span>
          </MenuItem>
          <MenuItem onClick={handleSearch}>
            <span>🔍</span>
            <span>{t('chat.menuSearch')}</span>
          </MenuItem>
          <MenuItem onClick={handleRefresh}>
            <span>↻</span>
            <span>{t('chat.menuRefresh')}</span>
          </MenuItem>

          <Divider />

          <SectionLabel>{t('chat.menuPinned')}</SectionLabel>
          <div className="px-4 py-2 text-xs text-text-subtle">
            {t('chat.menuEmpty')}
          </div>

          <Divider />

          <SectionLabel>{t('chat.menuConversations')}</SectionLabel>
          <button
            onClick={handleSessionClick}
            className="w-full text-left px-4 py-2 text-sm text-text hover:bg-card truncate"
          >
            {sessionLabel}
          </button>
        </div>
      )}
    </div>
  );
}