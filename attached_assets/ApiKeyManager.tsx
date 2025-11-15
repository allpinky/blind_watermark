// client/src/components/ApiKeyManager.tsx

const ANTHROPIC_PREFIX = ['sk', 'ant', ''].join('-');

export function isValidAnthropicKey(key: string): boolean {
  return key.startsWith(ANTHROPIC_PREFIX) && key.length >= 30;
}
