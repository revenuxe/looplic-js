const DEFAULT_SUPABASE_URL = "https://zhoverulwcybtgrezaob.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpob3ZlcnVsd2N5YnRncmV6YW9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTA5ODAsImV4cCI6MjA4OTQ4Njk4MH0.YF5MU9LB0fphsS4nu52P9-kXsswF27NOSzLTb3GdPag";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  DEFAULT_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  DEFAULT_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or VITE_SUPABASE_URL.");
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_PUBLISHABLE_KEY.");
}

export { supabaseAnonKey, supabaseUrl };
