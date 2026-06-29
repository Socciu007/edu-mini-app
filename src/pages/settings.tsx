import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Select } from 'zmp-ui'

import BookIcon from '@/static/icons/book.svg?react'
import BotIcon from '@/static/icons/bot.svg?react'
import GlobeIcon from '@/static/icons/globe.svg?react'
import HelpIcon from '@/static/icons/help.svg?react'
import LockIcon from '@/static/icons/lock.svg?react'
import RateIcon from '@/static/icons/rate.svg?react'
import ThemeIcon from '@/static/icons/theme.svg?react'

import { PageHeader } from '../components/page-header'
import { useTranslation } from '../i18n/use-translation'
import { useChatStore } from '../stores/chat-store'
import { type Language, useSettingsStore } from '../stores/settings-store'
import { type ThemeMode, useThemeStore } from '../stores/theme-store'

interface RowProps {
  Icon: React.FC<React.SVGProps<SVGSVGElement>>
  label: string
  value?: string
  onClick?: () => void
  danger?: boolean
}

function SettingRow({ Icon, label, value, onClick, danger }: RowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3 bg-surface text-left border-none ${
        danger ? 'text-danger' : 'text-text'
      }`}
    >
      <Icon className={`w-5 h-5 ${danger ? 'text-danger' : 'text-primary'}`} />
      <span className="flex-1 text-sm">{label}</span>
      {value ? <span className="text-xs text-text-secondary">{value}</span> : null}
      {onClick ? (
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="w-4 h-4 text-text-subtle">
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 01.02-1.06L10.94 10 7.23 6.29a.75.75 0 111.04-1.08l4.25 4.25a.75.75 0 010 1.08l-4.25 4.25a.75.75 0 01-1.06-.02z"
            clipRule="evenodd"
          />
        </svg>
      ) : null}
    </button>
  )
}

interface SelectRowProps {
  Icon: React.FC<React.SVGProps<SVGSVGElement>>
  label: string
  value: string | number
  placeholder: string
  onChange: (value: unknown) => void
  children: React.ReactNode
}

function SelectRow({ Icon, label, value, placeholder, onChange, children }: SelectRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-surface">
      <Icon className="w-5 h-5 text-primary shrink-0" />
      <span className="text-sm text-text shrink-0">{label}</span>
      <div className="flex-1 bg-transparent">
        <Select
          value={value}
          placeholder={placeholder}
          closeOnSelect
          maskCloseable
          className="border-none m-0 h-fit bg-transparent text-text-secondary select-css"
          onChange={onChange}
        >
          {children}
        </Select>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const language = useSettingsStore((s) => s.language)
  const setLanguage = useSettingsStore((s) => s.setLanguage)
  const mode = useThemeStore((s) => s.mode)
  const setMode = useThemeStore((s) => s.setMode)
  const aiReady = Boolean(import.meta.env.VITE_AI_API_KEY)

  function handleLanguageChange(value: unknown) {
    if (value === 'vi' || value === 'en') setLanguage(value)
  }

  function handleThemeChange(value: unknown) {
    if (value === 'light' || value === 'dark' || value === 'system') setMode(value)
  }

  function languageLabel(l: Language): string {
    return l === 'vi' ? t('user.languageVi') : t('user.languageEn')
  }

  function themeLabel(m: ThemeMode): string {
    if (m === 'light') return t('user.themeLight')
    if (m === 'dark') return t('user.themeDark')
    return t('user.themeSystem')
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title={t('settings.title')} onBack={() => nav(-1)} />

      <div className="overflow-y-auto pb-[4.5rem]">
        <section className="px-4 mt-[5.5rem]">
          <h2 className="text-xs font-semibold text-text-secondary uppercase mb-2">{t('settings.sectionGeneral')}</h2>
          <div className="bg-surface rounded-xl overflow-hidden divide-y divide-border">
            <SelectRow
              Icon={GlobeIcon}
              label={t('settings.language')}
              value={language}
              placeholder={languageLabel(language)}
              onChange={handleLanguageChange}
            >
              <Select.Option title={t('user.languageVi')} value="vi" />
              <Select.Option title={t('user.languageEn')} value="en" />
            </SelectRow>
            <SelectRow
              Icon={ThemeIcon}
              label={t('settings.theme')}
              value={mode}
              placeholder={themeLabel(mode)}
              onChange={handleThemeChange}
            >
              <Select.Option title={t('user.themeLight')} value="light" />
              <Select.Option title={t('user.themeDark')} value="dark" />
              <Select.Option title={t('user.themeSystem')} value="system" />
            </SelectRow>
          </div>
        </section>

        <section className="px-4 mt-6">
          <h2 className="text-xs font-semibold text-text-secondary uppercase mb-2">{t('settings.sectionInfo')}</h2>
          <div className="bg-surface rounded-xl overflow-hidden divide-y divide-border">
            <SettingRow
              Icon={BotIcon}
              label={t('settings.aiStatus')}
              value={aiReady ? t('settings.aiReady') : t('settings.aiNotConfigured')}
            />
            <SettingRow Icon={BookIcon} label={t('settings.about')} value="v1.0.0" />
            <SettingRow Icon={LockIcon} label={t('settings.security')} />
            <SettingRow Icon={HelpIcon} label={t('settings.support')} value={t('settings.supportValue')} />
            <SettingRow Icon={RateIcon} label={t('settings.rate')} />
          </div>
        </section>

        <footer className="px-4 mt-6 pb-8 text-xs text-text-subtle text-center">
          <p>{t('settings.footer.copyright')}</p>
        </footer>
      </div>
    </div>
  )
}
