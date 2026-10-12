const fs = require("node:fs");
const path = require("node:path");

const states = ["AZ", "CA", "ME", "MN", "TX"];
const stateNames = {
  AZ: "Arizona",
  CA: "California",
  ME: "Maine",
  MN: "Minnesota",
  TX: "Texas",
};
const statuses = [
  "Draft",
  "Sent",
  "Acknowledged",
  "Fulfilled",
  "Denied",
  "Appealed",
];
const topics = [
  "policy index",
  "aggregate staffing summary",
  "training outline",
  "contract index",
  "annual audit summary",
  "budget categories",
  "public meeting schedule",
  "records category index",
  "quarterly sample metrics",
  "retention schedule",
];

function seedSampleRequests() {
  return topics.map((topic, index) => {
    const state = states[index % states.length];
    const date = new Date(Date.UTC(2026, 7, index + 1)).toISOString().slice(0, 10);

    return {
      id: `sample-${index + 1}`,
      title: `Synthetic sample ${index + 1}: ${topic}`,
      request_text: `TEST FIXTURE ONLY: Request a fictional ${topic} for demonstration. No real records are represented.`,
      state,
      target_agency: `Fictional ${stateNames[state]} Records Office`,
      date_sent: date,
      status: statuses[index % statuses.length],
      deadline: null,
      created_at: `${date}T12:00:00Z`,
    };
  });
}

const requests = seedSampleRequests();
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
  `Seeded ${requests.length} fake requests (${stateCount} states, ${statusCount} statuses) into ${path.relative(process.cwd(), outputPath)}.`
);
