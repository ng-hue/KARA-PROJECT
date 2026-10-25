const fs = require("node:fs");
const path = require("node:path");

// Writes 10 fake requests to lib/sampleData.json for preview mode, and with
// --supabase also upserts them into the Supabase requests table.
// Covers the US6 test scenario (SCRUM-163): 3 overdue, 3 due soon, and
// 3 fulfilled past their deadline, plus 1 draft.
//
// Dates are relative to today in KARA's timezone, so rerun the seed before
// a demo or the due-soon rows drift into overdue. Set SEED_TODAY=YYYY-MM-DD
// to seed as of a fixed date.
//
// Supabase seeding uses the service role key (risk R2), read from
// SUPABASE_SERVICE_ROLE_KEY in .env.local. Never prefix it with NEXT_PUBLIC_.
// Seeded rows have fixed ids, so rerunning updates the same 10 rows instead
// of adding duplicates. Other rows are never touched.

const toSupabase = process.argv.includes("--supabase");

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
      created_at: `${dateSent}T12:00:00Z`,
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

  const outputPath = path.join(__dirname, "..", "lib", "sampleData.json");
  fs.writeFileSync(outputPath, `${JSON.stringify(requests, null, 2)}\n`);
  console.log(
    `Seeded ${requests.length} fake requests (${stateCount} states, ${statusCount} statuses) as of ${today} into ${path.relative(process.cwd(), outputPath)}.`
  );

  if (toSupabase) await seedSupabase(requests);
}

async function seedSupabase(requests) {
  try {
    process.loadEnvFile(path.join(__dirname, "..", ".env.local"));
  } catch {} // variables may already be set in the shell

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Supabase seeding needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local."
    );
  }

  const { createClient } = require("@supabase/supabase-js");
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  // created_at is left to the database default.
  const rows = requests.map(({ created_at, ...row }) => row);
  const { error } = await supabase.from("requests").upsert(rows, { onConflict: "id" });
  if (error) throw new Error(`Supabase upsert failed: ${error.message}`);

  const { count, error: countError } = await supabase
    .from("requests")
    .select("id", { count: "exact", head: true })
    .in("id", rows.map((r) => r.id));
  if (countError) throw new Error(`Supabase check failed: ${countError.message}`);
  if (count !== rows.length) {
    throw new Error(`Expected ${rows.length} seeded rows in Supabase, found ${count}.`);
  }
  console.log(`Upserted ${count} fake requests into Supabase public.requests.`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
