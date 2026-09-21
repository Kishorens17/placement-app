import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env.js';

const supabaseKey = config.supabase.serviceRoleKey || config.supabase.anonKey;

export const supabase = createClient(
  config.supabase.url,
  supabaseKey
);

export default supabase;

