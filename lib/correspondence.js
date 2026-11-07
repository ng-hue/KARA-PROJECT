import { getSupabase, isSupabaseConfigured } from "./supabase";
import { parseUsDate } from "./correspondenceRules";

// Entries for one request, newest message date first (S4 US4 order).
export async function listCorrespondence(requestId) {
  if (!isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await getSupabase()
    .from("correspondence")
    .select("*")
    .eq("request_id", requestId)
    .order("correspondence_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// Saves one entry. Call validateCorrespondence first.
// created_by is filled in by the database from the signed-in user.
export async function createCorrespondence(requestId, values) {
  if (!isSupabaseConfigured) {
    throw new Error("Correspondence requires Supabase to be configured.");
  }

  const { data, error } = await getSupabase()
    .from("correspondence")
    .insert({
      request_id: requestId,
      direction: values.direction,
      correspondence_date: parseUsDate(values.correspondence_date),
      sender: values.sender.trim(),
      summary: values.summary.trim(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
