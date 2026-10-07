import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'default-secret-key',
  supabase: {
    url: process.env.SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY,
  },
  github: {
    token: process.env.GITHUB_TOKEN,
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
    whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
  },
  resendApiKey: process.env.RESEND_API_KEY || '',
  openRouterUrl: process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions',
  aiKeys: {
    repoAnalysis: process.env.AI_KEY_REPO_ANALYSIS || '',
    problemRecommendation: process.env.AI_KEY_PROBLEM_RECOMMENDATION || '',
    targetSetting: process.env.AI_KEY_TARGET_SETTING || '',
    chatbot: process.env.AI_KEY_CHATBOT || '',
    resumeAnalysis: process.env.AI_KEY_CHATBOT || process.env.AI_KEY_REPO_ANALYSIS || '',
  },
};

