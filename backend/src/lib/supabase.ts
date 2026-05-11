import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// No throw on startup — the backend remains operational without Supabase
export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabase);
}

export function getSupabase() {
  if (!supabase) throw new Error("Supabase not configured");
  return supabase;
}
