import { getSupabase, isSupabaseConfigured } from "./supabase";
import { parseUsDate } from "./correspondenceRules";
import {
  ATTACHMENT_BUCKET,
  buildAttachmentPath,
  getAttachmentContentType,
} from "./attachmentRules";

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

// Number of entries per request
// Returns { [request_id]: count }
export async function countCorrespondenceByRequest() {
  if (!isSupabaseConfigured) {
    return {};
  }

  const { data, error } = await getSupabase()
    .from("correspondence")
    .select("request_id");

  if (error) {
    throw new Error(error.message);
  }

  const counts = {};
  for (const row of data) {
    counts[row.request_id] = (counts[row.request_id] || 0) + 1;
  }
  return counts;
}

// Saves one entry. Call validateCorrespondence first.
// created_by is filled in by the database from the signed-in user.
export async function createCorrespondence(requestId, values, attachment = null) {
  if (!isSupabaseConfigured) {
    throw new Error("Correspondence requires Supabase to be configured.");
  }

  const supabase = getSupabase();
  let id;
  let attachmentRef = null;

  if (attachment) {
    if (!globalThis.crypto?.randomUUID) {
      throw new Error("This browser cannot create a secure attachment ID.");
    }

    id = globalThis.crypto.randomUUID();
    attachmentRef = buildAttachmentPath(
      requestId,
      id,
      attachment.name
    );

    const { error: uploadError } = await supabase.storage
      .from(ATTACHMENT_BUCKET)
      .upload(attachmentRef, attachment, {
        contentType: getAttachmentContentType(attachment),
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Could not upload attachment: ${uploadError.message}`);
    }
  }

  const { data, error } = await supabase
    .from("correspondence")
    .insert({
      ...(id ? { id } : {}),
      request_id: requestId,
      direction: values.direction,
      correspondence_date: parseUsDate(values.correspondence_date),
      sender: values.sender.trim(),
      summary: values.summary.trim(),
      attachment_ref: attachmentRef,
    })
    .select()
    .single();

  if (error) {
    const message = attachmentRef
      ? `The file uploaded, but the correspondence entry could not be saved: ${error.message}. The file remains in Storage at ${attachmentRef}.`
      : error.message;
    throw new Error(message);
  }

  return data;
}

export async function createSignedAttachmentUrl(path) {
  const { data, error } = await getSupabase()
    .storage
    .from(ATTACHMENT_BUCKET)
    .createSignedUrl(path, 60);

  if (error) {
    throw new Error(error.message);
  }

  return data.signedUrl;
}
