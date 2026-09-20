import dotenv from 'dotenv';

dotenv.config();

export const AI_KEYS = {
  REPO_ANALYSIS: process.env.AI_KEY_REPO_ANALYSIS || '',
  PROBLEM_RECOMMENDATION: process.env.AI_KEY_PROBLEM_RECOMMENDATION || '',
  TARGET_SETTING: process.env.AI_KEY_TARGET_SETTING || '',
  CHATBOT: process.env.AI_KEY_CHATBOT || '',
};

export const AI_API_URLS = {
  OPENROUTER: process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions',
  NVIDIA: process.env.NVIDIA_API_URL || 'https://integrate.api.nvidia.com/v1/chat/completions',
};

// Function to get a working API key (implements rotation if needed)
export const getAvailableKey = (keyName: keyof typeof AI_KEYS): string => {
  const key = AI_KEYS[keyName];
  if (!key) {
    throw new Error(`AI key ${keyName} is not configured`);
  }
  return key;
};
