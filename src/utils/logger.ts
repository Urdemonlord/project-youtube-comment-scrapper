export const log = (...args: any[]): void => {
  if (import.meta.env.DEV || import.meta.env.VITE_DEBUG === 'true') {
    console.log(...args);
  }
};

export const warn = (...args: any[]): void => {
  if (import.meta.env.DEV || import.meta.env.VITE_DEBUG === 'true') {
    console.warn(...args);
  }
};

export const error = (...args: any[]): void => {
  console.error(...args);
};
