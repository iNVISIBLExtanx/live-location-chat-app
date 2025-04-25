import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Direct hardcoded values from .env file
const supabaseUrl = 'https://moqakiplpdzwvzdurlnf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vcWFraXBscGR6d3Z6ZHVybG5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNzc0MjMsImV4cCI6MjA2MDk1MzQyM30.H0mVwr1GzPhygCZNlsuR1ozbLusNQovqQNerlt0WiV8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
