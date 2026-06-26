import React from 'react';

interface Props {
  label: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  onClick?: () => void;
}

export function FunctionTile({ label, Icon, onClick }: Props) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1">
      <Icon className="w-7 h-7 text-primary" />
      <span className="text-xs text-text-secondary">{label}</span>
    </button>
  );
}