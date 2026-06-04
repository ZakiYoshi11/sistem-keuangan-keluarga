import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aykcalokuodedatnbslv.supabase.co/rest/v1/';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5a2NhbG9rdW9kZWRhdG5ic2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MjAyMjIsImV4cCI6MjA5NjA5NjIyMn0.lQE4KVbV6M5Fuy-1I880wCuvbbYz4ixUWufr8e78fxA';

const formatSupabaseUrl = (url: string) => {
  let cleaned = url.trim();
  if (cleaned.endsWith('/rest/v1/')) {
    cleaned = cleaned.slice(0, -9);
  } else if (cleaned.endsWith('/rest/v1')) {
    cleaned = cleaned.slice(0, -8);
  }
  if (cleaned.endsWith('/')) {
    cleaned = cleaned.slice(0, -1);
  }
  return cleaned;
};

export const supabaseUrl = formatSupabaseUrl(rawUrl);
export const supabase = createClient(supabaseUrl, key);
