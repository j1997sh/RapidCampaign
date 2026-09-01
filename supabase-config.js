/* Rapid Campaign Supabase configuration. */
window.RAPID_CAMPAIGN_SUPABASE = {
  url: "https://peatzuhtfakigpqyglzt.supabase.co",
  publishableKey: "sb_publishable_PkB4POQES8kc-5MriSQ_NA_LO8vPR8c"
};
if (!window.supabase) throw new Error('Supabase client library is not loaded.');
window.cpSupabase = window.supabase.createClient(
  window.RAPID_CAMPAIGN_SUPABASE.url,
  window.RAPID_CAMPAIGN_SUPABASE.publishableKey,
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
);
