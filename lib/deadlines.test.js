// One test per state, each comparing calculateDeadline to the documented
// research table. Dates cross a weekend but avoid holidays, because this
// version does not skip holidays yet.
// Run with: npm test

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateDeadline, deadlineLabel, STATE_DEADLINE_RULES } from "./deadlines.js";

describe("calculateDeadline by state", () => {
  it("AZ: no fixed deadline (promptly)", () => {
    assert.equal(calculateDeadline("AZ", "2026-10-14"), null);
    assert.equal(deadlineLabel("AZ"), "No Fixed Deadline (Promptly)");
  });

  it("CA: 10 calendar days", () => {
    // Mon 10/05 + 10 calendar days = Thu 10/15
    assert.equal(calculateDeadline("CA", "2026-10-05"), "2026-10-15");
  });

  it("ME: 5 business days", () => {
    // Wed 10/14: 15, 16, (weekend), 19, 20, 21
    assert.equal(calculateDeadline("ME", "2026-10-14"), "2026-10-21");
  });

  it("MN: no fixed deadline (promptly)", () => {
    assert.equal(calculateDeadline("MN", "2026-10-14"), null);
    assert.equal(deadlineLabel("MN"), "No Fixed Deadline (Promptly)");
  });

  it("TX: 10 business days", () => {
    // Wed 10/14: 15, 16, 19, 20, 21, 22, 23, 26, 27, 28
    assert.equal(calculateDeadline("TX", "2026-10-14"), "2026-10-28");
  });
});

describe("research table coverage", () => {
  for (const [state, rule] of Object.entries(STATE_DEADLINE_RULES)) {
    it(`${state} has a statute, citation and source link`, () => {
      assert.ok(rule.statuteName, "missing statuteName");
      assert.ok(rule.citation, "missing citation");
      assert.match(rule.sourceUrl ?? "", /^https:\/\//, "sourceUrl must start with https://");
    });
  }
});

describe("bad input", () => {
  it("returns null for an unknown state or a malformed date", () => {
    assert.equal(calculateDeadline("ZZ", "2026-10-14"), null);
    assert.equal(calculateDeadline("CA", "10/14/2026"), null);
  });
});