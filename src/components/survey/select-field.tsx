import React from 'react';

interface Option<V extends string | number> {
  value: V;
  label: string;
}

interface Props<V extends string | number> {
  label: string;
  value: V | '';
  options: Option<V>[];
  onChange: (value: V) => void;
  error?: string;
}

export function SelectField<V extends string | number>({ label, value, options, onChange, error }: Props<V>) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-text-secondary">{label}</label>
      <select
        value={value}
        onChange={(e) => {
          const v = e.target.value as unknown as V;
          onChange(v);
        }}
        className="border border-border rounded-lg px-3 py-2 text-sm bg-background"
      >
        <option value="" disabled>
          ---
        </option>
        {options.map((o) => (
          <option key={String(o.value)} value={o.value as unknown as string}>
            {o.label}
          </option>
        ))}
      </select>
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </div>
  );
}
