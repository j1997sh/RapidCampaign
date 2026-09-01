/* Rapid Campaign Supabase configuration.
   Copy assets/js/supabase-config.example.js over this file and add your project values. */
window.RAPID_CAMPAIGN_SUPABASE = {
  url: "https://YOUR_PROJECT.supabase.co",
  publishableKey: "YOUR_SUPABASE_PUBLISHABLE_KEY"
};
if (!window.supabase) throw new Error('Supabase client library is not loaded.');
if (window.RAPID_CAMPAIGN_SUPABASE.url.includes('YOUR_PROJECT')) {
  console.warn('Rapid Campaign: configure assets/js/supabase-config.js before use.');
}
window.cpSupabase = window.supabase.createClient(
  window.RAPID_CAMPAIGN_SUPABASE.url,
  window.RAPID_CAMPAIGN_SUPABASE.publishableKey,
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
);
