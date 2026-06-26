import React from 'react'
import { useNavigate } from 'react-router-dom'

import BookIcon from '@/static/icons/book.svg?react'
import BotIcon from '@/static/icons/bot.svg?react'
import GlobeIcon from '@/static/icons/globe.svg?react'
import HelpIcon from '@/static/icons/help.svg?react'
import LectureIcon from '@/static/icons/lecture.svg?react'
import LockIcon from '@/static/icons/lock.svg?react'
import PencilIcon from '@/static/icons/pencil.svg?react'
import RateIcon from '@/static/icons/rate.svg?react'
import RefreshIcon from '@/static/icons/refresh.svg?react'
import ReviewIcon from '@/static/icons/review.svg?react'
import SettingsIcon from '@/static/icons/settings.svg?react'
import StarIcon from '@/static/icons/star.svg?react'
import SurveyIcon from '@/static/icons/survey.svg?react'
import TestIcon from '@/static/icons/test.svg?react'
import ThemeIcon from '@/static/icons/theme.svg?react'

import { FunctionTile } from '../components/user/function-tile'
import { GradientHeader } from '../components/user/gradient-header'
import { InfoBanner } from '../components/user/info-banner'
import { QuickAction } from '../components/user/quick-action'
import { useTranslation } from '../i18n/use-translation'
import { useChatStore } from '../stores/chat-store'
import { type ThemeMode, useThemeStore } from '../stores/theme-store'

const THEME_MODES: ThemeMode[] = ['light', 'dark', 'system']

export default function UserPage() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const resetChat = useChatStore((s) => s.reset)
  const mode = useThemeStore((s) => s.mode)
  const setMode = useThemeStore((s) => s.setMode)

  return (
    <div className="pb-16">
      <GradientHeader
        title={t('user.loginTitle')}
        subtitle={t('user.loginSubtitle')}
        buttonText={t('user.loginButton')}
        onButtonClick={() => nav('/')}
      />

      {/* Quick actions */}
      <div className="px-4 -mt-6 relative z-10">
        <div className="bg-surface rounded-xl shadow-sm p-4 flex justify-around">
          <QuickAction label={t('survey.headerTitle')} to="/survey" Icon={SurveyIcon} />
          <QuickAction label={t('user.favorite')} to="/review" Icon={StarIcon} />
          <QuickAction label={t('review.headerTitle')} to="/review" Icon={ReviewIcon} />
        </div>
      </div>

      {/* AI banner */}
      <div className="px-4 mt-4">
        <InfoBanner
          title={t('user.aiBanner.title')}
          subtitle={t('user.aiBanner.subtitle')}
          cta={t('user.aiBanner.cta')}
          Icon={BotIcon}
          onCtaClick={() => nav('/')}
        />
      </div>

      {/* Common functions */}
      <section className="px-4 mt-6">
        <h2 className="text-sm font-semibold text-text mb-3">{t('user.commonFunctions')}</h2>
        <div className="bg-surface rounded-xl p-4 grid grid-cols-4 gap-4">
          <FunctionTile label={t('user.subjects')} Icon={BookIcon} />
          <FunctionTile label={t('user.exercises')} Icon={PencilIcon} />
          <FunctionTile label={t('user.lessons')} Icon={LectureIcon} />
          <FunctionTile label={t('user.exams')} Icon={TestIcon} />
        </div>
      </section>

      {/* Other functions */}
      <section className="px-4 mt-6">
        <h2 className="text-sm font-semibold text-text mb-3">{t('user.otherFunctions')}</h2>
        <div className="bg-surface rounded-xl p-4 grid grid-cols-4 gap-4">
          <FunctionTile label={t('user.settings')} Icon={SettingsIcon} />
          <FunctionTile label={t('user.language')} Icon={GlobeIcon} />
          <FunctionTile
            label={t('user.theme')}
            Icon={ThemeIcon}
            onClick={() => {
              const next = THEME_MODES[(THEME_MODES.indexOf(mode) + 1) % THEME_MODES.length]
              setMode(next)
            }}
          />
          <FunctionTile label={t('user.reset')} Icon={RefreshIcon} onClick={() => resetChat()} />
          <FunctionTile label={t('user.ai')} Icon={BotIcon} onClick={() => nav('/')} />
          <FunctionTile label={t('user.security')} Icon={LockIcon} />
          <FunctionTile label={t('user.support')} Icon={HelpIcon} />
          <FunctionTile label={t('user.rate')} Icon={RateIcon} />
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 mt-6 pb-8 text-xs text-text-subtle text-center space-y-1">
        <p>{t('user.footer.support')}</p>
        <p>{t('user.footer.copyright')}</p>
      </footer>
    </div>
  )
}
