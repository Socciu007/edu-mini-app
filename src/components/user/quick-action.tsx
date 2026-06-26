import React from 'react';
import { NavLink } from 'react-router-dom';

interface Props {
  label: string;
  to: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export function QuickAction({ label, to, Icon }: Props) {
  return (
    <NavLink to={to} className="flex flex-col items-center gap-1">
      <div className="w-12 h-12 rounded-full bg-accent-soft flex items-center justify-center">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <span className="text-xs text-text-secondary">{label}</span>
    </NavLink>
  );
}