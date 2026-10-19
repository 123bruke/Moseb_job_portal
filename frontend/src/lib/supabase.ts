import { createClient } from "@supabase/supabase-js";

// Supabase JS is used for AUTH ONLY. All data goes through the FastAPI backend.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL ?? "http://localhost:54321",
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? "anon",
);
