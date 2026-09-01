/* Rapid Campaign Supabase configuration. */
window.RAPID_CAMPAIGN_SUPABASE = {
  url: "https://peatzuhtfakigpqyglzt.supabase.co",
  publishableKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlYXR6dWh0ZmFraWdwcXlnbHp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyNjU5MzksImV4cCI6MjEwMzg0MTkzOX0.ghHeCyQfSX5rd1Beirvt3n5TtCQtFzIClEwwjXcLCHc"
};
if (!window.supabase) throw new Error('Supabase client library is not loaded.');
window.cpSupabase = window.supabase.createClient(
  window.RAPID_CAMPAIGN_SUPABASE.url,
  window.RAPID_CAMPAIGN_SUPABASE.publishableKey,
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
);
