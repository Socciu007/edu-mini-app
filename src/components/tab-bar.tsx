import React from 'react'
import { NavLink } from 'react-router-dom'

import ChatIcon from '@/static/icons/chat.svg?react'
import ReviewIcon from '@/static/icons/review.svg?react'
import SurveyIcon from '@/static/icons/survey.svg?react'
import UserIcon from '@/static/icons/user.svg?react'

import { useTranslation } from '../i18n/use-translation'

interface TabDef {
  to: string
  Icon: React.FC<React.SVGProps<SVGSVGElement>>
  labelKey: 'chat' | 'survey' | 'review' | 'user'
}

const TABS: TabDef[] = [
  { to: '/', Icon: ChatIcon, labelKey: 'chat' },
  { to: '/survey', Icon: SurveyIcon, labelKey: 'survey' },
  { to: '/review', Icon: ReviewIcon, labelKey: 'review' },
  { to: '/user', Icon: UserIcon, labelKey: 'user' },
]

export function TabBar() {
  const { t } = useTranslation()
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-tabbar border-border flex justify-around pb-[env(safe-area-inset-bottom)] z-50"
      role="navigation"
      aria-label="Main"
    >
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) =>
            `tab-item flex flex-col no-underline items-center justify-center flex-1 py-2 text-xs ${
              isActive ? 'text-primary font-semibold is-active' : 'text-text-subtle font-normal'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <tab.Icon className="w-5 h-5 mb-1" aria-hidden="true" />
              {!isActive && <span>{t(`tabs.${tab.labelKey}`)}</span>}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
