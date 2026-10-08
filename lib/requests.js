import { getSupabase, isSupabaseConfigured } from "./supabase";
import { calculateDeadline } from "./deadlines";
import { DEFAULT_STATUS, STATES, STATUSES } from "./constants";
import { SAMPLE_REQUESTS } from "./sampleData";

// Preview mode keeps requests in this browser only, so the team can
// see and use the app before Supabase is set up.
const PREVIEW_KEY = "kara-prt-preview-requests";

function readPreview() {
  try {
    const saved = window.localStorage.getItem(PREVIEW_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return SAMPLE_REQUESTS;
}

function writePreview(rows) {
  try {
    window.localStorage.setItem(PREVIEW_KEY, JSON.stringify(rows));
  } catch {}
}

export function resetPreviewData() {
  try {
    window.localStorage.removeItem(PREVIEW_KEY);
  } catch {}
}

function sortNewestFirst(rows) {
  return [...rows].sort((a, b) => b.date_sent.localeCompare(a.date_sent));
}

export async function listRequests() {
  if (!isSupabaseConfigured) return sortNewestFirst(readPreview());

  const { data, error } = await getSupabase()
    .from("requests")
    .select("*")
    .order("date_sent", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

// Returns an object of field -> error message. Empty means valid.
export function validateRequest(values) {
  const errors = {};
  if (!values.title?.trim()) errors.title = "Enter a title.";
  if (!values.request_text?.trim()) errors.request_text = "Enter the request text.";
  if (!STATES.some((s) => s.code === values.state)) errors.state = "Choose a state.";
  if (!values.target_agency?.trim()) errors.target_agency = "Enter the target agency.";
  if (!values.date_sent) errors.date_sent = "Choose the date sent.";
  if (values.status && !STATUSES.includes(values.status)) errors.status = "Choose a valid status.";
  return errors;
}

export async function createRequest(values) {
  const row = {
    title: values.title.trim(),
    request_text: values.request_text.trim(),
    state: values.state,
    target_agency: values.target_agency.trim(),
    date_sent: values.date_sent,
    status: values.status || DEFAULT_STATUS,
    deadline: calculateDeadline(values.state, values.date_sent),
  };

  if (!isSupabaseConfigured) {
    const saved = {
      ...row,
      id: `preview-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    writePreview([saved, ...readPreview()]);
    return saved;
  }

  const { data, error } = await getSupabase()
    .from("requests")
    .insert(row)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}
