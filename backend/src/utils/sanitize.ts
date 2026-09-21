export function sanitizeLeetcodeUsername(input: string): string {
  if (!input) return '';
  let cleaned = input.trim();
  cleaned = cleaned.split('?')[0].split('#')[0];
  cleaned = cleaned.replace(/^https?:\/\//i, '');
  cleaned = cleaned.replace(/^www\./i, '');
  const match = cleaned.match(/^(?:leetcode\.com\/(?:u\/)?|@)?([a-zA-Z0-9_-]+)\/?.*$/i);
  if (match && match[1]) {
    return match[1];
  }
  return cleaned.replace(/^@/, '').replace(/\/+$/, '');
}

export function sanitizeGithubUsername(input: string): string {
  if (!input) return '';
  let cleaned = input.trim();
  cleaned = cleaned.split('?')[0].split('#')[0];
  cleaned = cleaned.replace(/^https?:\/\//i, '');
  cleaned = cleaned.replace(/^www\./i, '');
  const match = cleaned.match(/^(?:github\.com\/|@)?([a-zA-Z0-9_-]+)\/?.*$/i);
  if (match && match[1]) {
    return match[1];
  }
  return cleaned.replace(/^@/, '').replace(/\/+$/, '');
}
