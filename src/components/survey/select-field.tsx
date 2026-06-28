import { Listbox, Transition } from '@headlessui/react'
import React, { Fragment } from 'react'

interface Option<V extends string | number> {
  value: V
  label: string
}

interface Props<V extends string | number> {
  label: string
  value: V | ''
  options: Option<V>[]
  onChange: (value: V) => void
  error?: string
  placeholder?: string
}

export function SelectField<V extends string | number>({
  label,
  value,
  options,
  onChange,
  error,
  placeholder = '-',
}: Props<V>) {
  const selected = options.find((o) => o.value === value) ?? null

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-text-secondary">{label}</label>
      <Listbox value={value} onChange={(v) => onChange(v as V)}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-default border border-border rounded-lg bg-primary-foreground py-2 pl-3 pr-9 text-left text-sm focus:outline-none focus:ring-1 focus:ring-primary">
            <span className={selected ? 'block truncate' : 'block truncate text-text-secondary'}>
              {selected ? selected.label : placeholder}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-text-secondary">
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4">
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.084l3.71-3.853a.75.75 0 111.08 1.04l-4.25 4.41a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-75"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-primary-foreground py-1 text-sm shadow-lg ring-1 ring-border focus:outline-none">
              {options.map((o) => (
                <Listbox.Option
                  key={String(o.value)}
                  value={o.value}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-3 pr-9 ${
                      active ? 'bg-primary text-primary-foreground' : 'text-text'
                    }`
                  }
                >
                  {({ selected: isSelected }) => (
                    <>
                      <span className={`block truncate ${isSelected ? 'font-medium' : 'font-normal'}`}>{o.label}</span>
                      {isSelected ? (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-primary-foreground">
                          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4">
                            <path
                              fillRule="evenodd"
                              d="M16.704 5.29a1 1 0 010 1.42l-7.997 8a1 1 0 01-1.414 0l-3.997-4a1 1 0 011.414-1.42L8 12.585l7.29-7.296a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </div>
  )
}
