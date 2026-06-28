import React from 'react'

interface Props {
  title: string
  subtitle: string
  cta: string
  Icon: React.FC<React.SVGProps<SVGSVGElement>>
  onCtaClick: () => void
}

export function InfoBanner({ title, subtitle, cta, Icon, onCtaClick }: Props) {
  return (
    <div
      className="rounded-xl p-4 flex items-center gap-3 text-white"
      style={{ background: 'linear-gradient(to right, var(--color-accent), var(--color-primary))' }}
    >
      <Icon className="w-10 h-10" />
      <div className="flex-1">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-xs text-white/80">{subtitle}</p>
      </div>
      <button
        onClick={onCtaClick}
        className="bg-white text-primary font-medium px-3 py-1 rounded-lg text-sm border border-border"
      >
        {cta}
      </button>
    </div>
  )
}
