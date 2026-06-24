const enabled = import.meta.env.DEV;

export const log = {
  info: (...args: unknown[]) => { if (enabled) console.debug('[edu]', ...args); },
  warn: (...args: unknown[]) => { if (enabled) console.warn('[edu]', ...args); },
};
