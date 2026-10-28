const path = require("node:path");

// Upserts 10 fake requests into the shared Supabase requests table.
// Covers the US6 test scenario (SCRUM-163): 3 overdue, 3 due soon, and
// 3 fulfilled past their deadline, plus 1 draft.
//
// Dates are relative to today in KARA's timezone, so rerun the seed before
// a demo or the due-soon rows drift into overdue. Set SEED_TODAY=YYYY-MM-DD
// to seed as of a fixed date.
//
// Uses the service role key (risk R2), read from SUPABASE_SERVICE_ROLE_KEY in
// .env.local. Never prefix it with NEXT_PUBLIC_.
// Seeded rows have fixed ids, so rerunning updates the same 10 rows instead
// of adding duplicates. Other rows are never touched.

// Fixed ids for the seeded rows: 00000000-0000-4000-8000-000000000001 to ...010.
const seedId = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

const stateNames = {
  AZ: "Arizona",
  CA: "California",
  ME: "Maine",
  MN: "Minnesota",
  TX: "Texas",
};

// daysAgo is how long before today the request was sent.
// CA is 10 calendar days, so sent 4 to 6 days ago is due in 4 to 6 days.
const scenarios = [
  { topic: "policy index",            state: "TX", status: "Sent",         daysAgo: 30, expect: "overdue" },
  { topic: "aggregate staffing summary", state: "ME", status: "Acknowledged", daysAgo: 25, expect: "overdue" },
  { topic: "training outline",        state: "CA", status: "Sent",         daysAgo: 20, expect: "overdue" },
  { topic: "contract index",          state: "CA", status: "Sent",         daysAgo: 4,  expect: "due_soon" },
  { topic: "annual audit summary",    state: "CA", status: "Acknowledged", daysAgo: 5,  expect: "due_soon" },
  { topic: "budget categories",       state: "CA", status: "Sent",         daysAgo: 6,  expect: "due_soon" },
  { topic: "public meeting schedule", state: "TX", status: "Fulfilled",    daysAgo: 40, expect: null, pastDeadline: true },
  { topic: "records category index",  state: "ME", status: "Fulfilled",    daysAgo: 35, expect: null, pastDeadline: true },
  { topic: "quarterly sample metrics", state: "CA", status: "Fulfilled",   daysAgo: 30, expect: null, pastDeadline: true },
  { topic: "retention schedule",      state: "AZ", status: "Draft",        daysAgo: 1,  expect: null },
];

async function main() {
  const { calculateDeadline, addDays } = await import("../lib/deadlines.js");
  const { getRequestFlag, localToday } = await import("../lib/deadlineFlags.js");

  const today = process.env.SEED_TODAY || localToday();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) throw new Error("SEED_TODAY must be YYYY-MM-DD.");
  const minusDays = (days) => addDays(today, -days, "calendar");

  const requests = scenarios.map((s, index) => {
    const dateSent = minusDays(s.daysAgo);
    return {
      id: seedId(index + 1),
      title: `Synthetic sample ${index + 1}: ${s.topic}`,
      request_text: `TEST FIXTURE ONLY: Request a fictional ${s.topic} for demonstration. No real records are represented.`,
      state: s.state,
      target_agency: `Fictional ${stateNames[s.state]} Records Office`,
      date_sent: dateSent,
      status: s.status,
      deadline: s.status === "Draft" ? null : calculateDeadline(s.state, dateSent),
    };
  });

  // Check every row against the shared flag helper before writing.
  requests.forEach((r, index) => {
    const s = scenarios[index];
    const flag = getRequestFlag({ state: r.state, status: r.status, dateSent: r.date_sent, today });
    if ((flag?.key ?? null) !== s.expect) {
      throw new Error(`${r.id} expected flag ${s.expect}, got ${flag?.key ?? null}.`);
    }
    if (s.pastDeadline && !(r.deadline && r.deadline < today)) {
      throw new Error(`${r.id} should be past its deadline.`);
    }
  });

  const stateCount = new Set(requests.map(({ state }) => state)).size;
  const statusCount = new Set(requests.map(({ status }) => status)).size;

  if (requests.length !== 10 || stateCount < 3 || statusCount < 3) {
    throw new Error(
      `Seed data must contain 10 requests, at least 3 states, and at least 3 statuses. ` +
        `Got ${requests.length} requests, ${stateCount} states, and ${statusCount} statuses.`
    );
  }

  console.log(
    `Built ${requests.length} fake requests (${stateCount} states, ${statusCount} statuses) as of ${today}.`
  );

  await seedSupabase(requests);
}

async function seedSupabase(requests) {
  try {
    process.loadEnvFile(path.join(__dirname, "..", ".env.local"));
  } catch {} // variables may already be set in the shell

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "The seed needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local."
    );
  }

  // Calls the Supabase REST API with fetch instead of supabase-js, whose
  // realtime client needs native WebSocket and fails on Node 20.
  const api = restClient(url, serviceKey);

  // created_at is left to the database default.
  const rows = requests;
  const upsert = await api("POST", "requests?on_conflict=id", rows, {
    Prefer: "resolution=merge-duplicates,return=minimal",
  });
  if (upsert.error) throw new Error(`Supabase upsert failed: ${upsert.error.message}`);

  const seeded = await api("GET", `requests?select=id&id=in.(${rows.map((r) => r.id).join(",")})`);
  if (seeded.error) throw new Error(`Supabase check failed: ${seeded.error.message}`);
  if (seeded.data.length !== rows.length) {
    throw new Error(`Expected ${rows.length} seeded rows in Supabase, found ${seeded.data.length}.`);
  }
  console.log(`Upserted ${seeded.data.length} fake requests into Supabase public.requests.`);

  await seedStatusHistory(api, rows);
}

// Minimal PostgREST client. Returns { data, error } like supabase-js.
function restClient(url, key) {
  const base = `${url.replace(/\/$/, "")}/rest/v1/`;
  return async (method, pathAndQuery, body, extraHeaders = {}) => {
    const res = await fetch(base + pathAndQuery, {
      method,
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        ...extraHeaders,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    const json = text ? JSON.parse(text) : null;
    if (!res.ok) {
      return { data: null, error: { code: json?.code, message: json?.message ?? `HTTP ${res.status}` } };
    }
    return { data: json, error: null };
  };
}

// Missing table: Postgres 42P01, or PostgREST PGRST205 (not in schema cache).
const MISSING_TABLE_CODES = ["42P01", "PGRST205"];

// Gives each seeded request one "Request created" history row (risk R4),
// matching the backfill in supabase/status_history.sql (US5). Skipped when
// the status_history table does not exist yet. Requests that already have
// history are left alone, so reruns add nothing.
async function seedStatusHistory(api, rows) {
  const { data: existing, error } = await api(
    "GET",
    `status_history?select=request_id&request_id=in.(${rows.map((r) => r.id).join(",")})`
  );
  if (error && MISSING_TABLE_CODES.includes(error.code)) {
    console.log("Skipped status history: the status_history table does not exist yet.");
    return;
  }
  if (error) throw new Error(`Status history check failed: ${error.message}`);

  const hasHistory = new Set(existing.map((h) => h.request_id));
  const missing = rows
    .filter((r) => !hasHistory.has(r.id))
    .map((r) => ({
      request_id: r.id,
      from_status: null,
      to_status: r.status,
      changed_by: null,
      note: "Request created",
    }));

  if (missing.length > 0) {
    const { error: insertError } = await api("POST", "status_history", missing, {
      Prefer: "return=minimal",
    });
    if (insertError) throw new Error(`Status history insert failed: ${insertError.message}`);
  }
  console.log(
    `Status history: added ${missing.length}, ${hasHistory.size} seeded requests already had history.`
  );
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
