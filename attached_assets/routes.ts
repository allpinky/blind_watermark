// server/routes.ts

const PREFIXES = {
  anthropic: ['sk', 'ant', ''].join('-'),
  openai: ['sk', 'live', ''].join('-'),
};

function isKeyValid(provider: string, key: string): boolean {
  const trimmedKey = key.trim();
  if (provider === 'anthropic' && trimmedKey.startsWith(PREFIXES.anthropic) && trimmedKey.length >= 30) {
    return true;
  }
  if (provider === 'openai' && trimmedKey.startsWith(PREFIXES.openai) && trimmedKey.length >= 30) {
    return true;
  }
  return false;
}
