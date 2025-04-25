/**
 * Environment utility for managing configuration settings
 */

// Import environment variables - in a real app, use a proper environment loading library
// For now, we'll use hard-coded values with a note to replace them
const ENV = {
  SUPABASE_URL: process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL_HERE',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY_HERE',
};

/**
 * Get environment variable by key
 */
export const getEnv = (key: keyof typeof ENV): string => {
  return ENV[key];
};

/**
 * Check if environment is correctly configured
 */
export const isEnvironmentConfigured = (): boolean => {
  return (
    ENV.SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE' &&
    ENV.SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY_HERE'
  );
};

/**
 * Get user-friendly error message for missing environment configuration
 */
export const getEnvironmentErrorMessage = (): string => {
  const missingVars = [];
  
  if (ENV.SUPABASE_URL === 'YOUR_SUPABASE_URL_HERE') {
    missingVars.push('SUPABASE_URL');
  }
  
  if (ENV.SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY_HERE') {
    missingVars.push('SUPABASE_ANON_KEY');
  }
  
  return `Missing environment variables: ${missingVars.join(', ')}. Please update the .env file.`;
};
