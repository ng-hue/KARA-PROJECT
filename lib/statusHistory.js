import { getSupabase, isSupabaseConfigured } from "./supabase";
import { canTransitionStatus } from "./statusTransitions";

export async function listStatusHistory(requestId) {
  if (!isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await getSupabase()
    .from("status_history")
    .select("*")
    .eq("request_id", requestId)
    .order("changed_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function changeRequestStatus(
  requestId,
  currentStatus,
  newStatus,
  note = ""
) {
  if (!canTransitionStatus(currentStatus, newStatus)) {
    throw new Error(
      `Invalid status transition from ${currentStatus} to ${newStatus}.`
    );
  }

  if (!isSupabaseConfigured) {
    throw new Error("Status changes require Supabase to be configured.");
  }

  const { data, error } = await getSupabase().rpc("change_request_status", {
    p_request_id: requestId,
    p_new_status: newStatus,
    p_note: note || null,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}