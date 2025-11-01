// supabaseClient.js
// import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// const SUPABASE_URL = "https://lqkrbvwoimnnrvirlddx.supabase.co";
// const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxxa3JidndvaW1ubnJ2aXJsZGR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NTQxODksImV4cCI6MjA3NzUzMDE4OX0.vLxL7Qy1kByeb92StzHWWJYWsFH1-EBn9ZJIvlN3g3g";

// export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);


import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://lqkrbvwoimnnrvirlddx.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper: fetch leaderboard sorted by progress
export async function getLeaderboard() {
  const { data, error } = await supabase
    .from("leaderboard")
    .select("*")
    .order("progress", { ascending: false })
    .order("updated_at", { ascending: true });
  if (error) throw error;
  return data;
}

// Helper: validate player code + get leaderboard
export async function validateCodeEmail(code, name, email) {
  const { data: existing, error } = await supabase
    .from("codes")
    .select("*")
    .eq("code", code)
    .single();

  if (error || !existing) {
    return { status: "invalid" };
  }

  if (existing.locked) {
    return { status: "locked" };
  }

  // Code already claimed by another email
  if (existing.claimed_by && existing.claimed_by !== email) {
    return { status: "claimed_by_other" };
  }

  // Update ownership if not claimed
  if (!existing.claimed_by) {
    await supabase
      .from("codes")
      .update({ claimed_by: email, name, email })
      .eq("code", code);
  }

  const progress = existing.progress || 0;
  return { status: "ok", name: existing.name || name, progress };
}

// Update progress
export async function updateProgress(code, progress) {
  const { error } = await supabase
    .from("codes")
    .update({ progress })
    .eq("code", code);
  if (error) throw error;
  return true;
}