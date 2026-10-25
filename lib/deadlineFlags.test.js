// Flag rules for US6 (SCRUM-183). Statuses use the Title Case values
// stored in the requests table. Run with: npm test

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getRequestFlag, localToday } from "./deadlineFlags.js";

// TX request sent Wed 10/14 is due Wed 10/28.
const tx = { state: "TX", dateSent: "2026-10-14" };
const key = (args) => getRequestFlag(args)?.key ?? null;

describe("overdue", () => {
  it("deadline before today, Sent or Acknowledged", () => {
    assert.equal(key({ ...tx, status: "Sent", today: "2026-10-29" }), "overdue");
    assert.equal(key({ ...tx, status: "Acknowledged", today: "2026-10-29" }), "overdue");
    assert.equal(getRequestFlag({ ...tx, status: "Sent", today: "2026-10-29" }).label, "Overdue");
  });

  it("not overdue on the deadline day", () => {
    assert.equal(key({ ...tx, status: "Sent", today: "2026-10-28" }), "due_soon");
  });
});

describe("due soon", () => {
  it("deadline within the next 7 days", () => {
    // 10/21 + 7 = 10/28
    assert.equal(key({ ...tx, status: "Sent", today: "2026-10-21" }), "due_soon");
    // 10/20 + 7 = 10/27, deadline is 10/28
    assert.equal(key({ ...tx, status: "Sent", today: "2026-10-20" }), null);
  });
});

describe("never flagged", () => {
  for (const status of ["Fulfilled", "Denied", "Appealed", "Draft"]) {
    it(`${status}, even past the deadline`, () => {
      assert.equal(key({ ...tx, status, today: "2026-12-01" }), null);
      assert.equal(key({ ...tx, status, today: "2026-10-27" }), null);
    });
  }

  it("unsupported state has no deadline to flag", () => {
    assert.equal(key({ state: "ZZ", dateSent: "2026-10-14", status: "Sent", today: "2026-12-01" }), null);
  });
});

describe("estimated deadlines", () => {
  it("flag the same way, labeled (Est.)", () => {
    // AZ sent 10/14, estimated 10/23
    const flag = getRequestFlag({ state: "AZ", dateSent: "2026-10-14", status: "Sent", today: "2026-10-26" });
    assert.equal(flag.key, "overdue");
    assert.equal(flag.label, "Overdue (Est.)");
  });
});

describe("localToday", () => {
  it("uses KARA's timezone, not UTC", () => {
    // 03:00 UTC on 10/27 is 10:00 PM on 10/26 in Minnesota (CDT)
    assert.equal(localToday(new Date("2026-10-27T03:00:00Z")), "2026-10-26");
  });
});
