// server/keyValidation.ts

const PREFIXES = {
  anthropic: ['sk', 'ant', ''].join('-'),
  google: ['AIza', 'Sy'].join(''),
};

export const base64Prefixes = {
  anthropic: Buffer.from(PREFIXES.anthropic).toString('base64'),
  google: Buffer.from(PREFIXES.google).toString('base64'),
};
