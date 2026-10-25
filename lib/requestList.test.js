// List sorting and filters for US6 (SCRUM-184, SCRUM-185), checked
// against the seed scenario. Run with: npm test

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  applyFilters,
  filtersToQuery,
  parseFilters,
  sortForList,
  withDeadlines,
} from "./requestList.js";

const today = "2026-10-26";

// CA deadlines are date sent + 10 calendar days.
const rows = withDeadlines(
  [
    { id: "draft",     state: "CA", status: "Draft",        date_sent: "2026-10-25" },
    { id: "soon-6",    state: "CA", status: "Sent",         date_sent: "2026-10-22" }, // due 11/01
    { id: "late-2",    state: "CA", status: "Sent",         date_sent: "2026-10-10" }, // due 10/20
    { id: "fulfilled", state: "CA", status: "Fulfilled",    date_sent: "2026-09-01" }, // due 09/11
    { id: "soon-4",    state: "CA", status: "Acknowledged", date_sent: "2026-10-20" }, // due 10/30
    { id: "late-1",    state: "CA", status: "Acknowledged", date_sent: "2026-10-01" }, // due 10/11
    { id: "later",     state: "CA", status: "Sent",         date_sent: "2026-10-25" }, // due 11/04
  ],
  today
);

describe("withDeadlines", () => {
  it("Draft has no deadline", () => {
    assert.equal(rows.find((r) => r.id === "draft").deadlineInfo, null);
  });
});

describe("sortForList", () => {
  it("overdue first, then deadline ascending, no deadline last", () => {
    assert.deepEqual(
      sortForList(rows).map((r) => r.id),
      ["late-1", "late-2", "fulfilled", "soon-4", "soon-6", "later", "draft"]
    );
  });
});

describe("applyFilters", () => {
  it("overdue filter", () => {
    assert.deepEqual(applyFilters(rows, { status: "", flag: "overdue" }).map((r) => r.id).sort(), ["late-1", "late-2"]);
  });

  it("due soon filter", () => {
    assert.deepEqual(applyFilters(rows, { status: "", flag: "due_soon" }).map((r) => r.id).sort(), ["soon-4", "soon-6"]);
  });

  it("status and flag together", () => {
    assert.deepEqual(applyFilters(rows, { status: "Sent", flag: "overdue" }).map((r) => r.id), ["late-2"]);
  });

  it("no filters returns every row", () => {
    assert.equal(applyFilters(rows, { status: "", flag: "" }).length, rows.length);
  });
});

describe("query string", () => {
  it("round trips", () => {
    const query = filtersToQuery({ status: "Sent", flag: "overdue" });
    assert.equal(query, "?status=Sent&flag=overdue");
    assert.deepEqual(parseFilters(new URLSearchParams(query)), { status: "Sent", flag: "overdue" });
  });

  it("ignores unknown values", () => {
    assert.deepEqual(parseFilters(new URLSearchParams("?status=Lost&flag=late")), { status: "", flag: "" });
    assert.equal(filtersToQuery({ status: "", flag: "" }), "");
  });
});
