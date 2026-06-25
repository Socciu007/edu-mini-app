import React from 'react'
import { NavLink } from 'react-router-dom'

import { useTranslation } from '../i18n/use-translation'

interface TabDef {
  to: string
  emoji: string
  labelKey: 'chat' | 'survey' | 'review' | 'user'
}

const TABS: TabDef[] = [
  { to: '/', emoji: '💬', labelKey: 'chat' },
  { to: '/survey', emoji: '📝', labelKey: 'survey' },
  { to: '/review', emoji: '📊', labelKey: 'review' },
  { to: '/user', emoji: '👤', labelKey: 'user' },
]

export function TabBar() {
  const { t } = useTranslation()
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-gray-200 flex justify-around pb-[env(safe-area-inset-bottom)] z-50"
      role="navigation"
      aria-label="Main"
    >
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) =>
            `tab-item no-underline flex flex-col items-center justify-center flex-1 py-2 text-xs ${
              isActive ? 'text-blue-500 font-semibold is-active' : 'text-gray-500 font-normal'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className="text-xl leading-none mb-1" aria-hidden="true">
                {tab.emoji}
              </span>
              {!isActive && <span>{t(`tabs.${tab.labelKey}`)}</span>}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
