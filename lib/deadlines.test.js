// One test per state, each comparing getDeadlineInfo to the documented
// research table. Dates cross a weekend but avoid holidays, because
// holidays are ignored by sponsor decision.
// Run with: npm test

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  NOT_SUPPORTED_LABEL,
  NO_STATUTORY_DEADLINE_LABEL,
  STATE_DEADLINE_RULES,
  businessDaysBetween,
  calculateDeadline,
  deadlineLabel,
  getDeadlineInfo,
} from "./deadlines.js";
import { STATES } from "./constants.js";

describe("getDeadlineInfo by state", () => {
  it("AK: 10 business days to respond (sponsor rule, S5 US7)", () => {
    // Wed 10/14: 15, 16, 19, 20, 21, 22, 23, 26, 27, 28
    const info = getDeadlineInfo("AK", "2026-10-14");
    assert.equal(info.kind, "statutory");
    assert.equal(info.date, "2026-10-28");
    assert.equal(deadlineLabel("AK"), "10 Business Days To Respond*");
  });

  it("AZ: no statutory deadline", () => {
    const info = getDeadlineInfo("AZ", "2026-10-14");
    assert.equal(info.kind, "none");
    assert.equal(info.date, null);
    assert.equal(deadlineLabel("AZ"), NO_STATUTORY_DEADLINE_LABEL);
  });

  it("CA: 10 calendar days to decide", () => {
    // Mon 10/05 + 10 calendar days = Thu 10/15
    const info = getDeadlineInfo("CA", "2026-10-05");
    assert.equal(info.kind, "statutory");
    assert.equal(info.date, "2026-10-15");
    assert.equal(deadlineLabel("CA"), "10 Calendar Days To Decide*");
  });

  it("FL: no statutory deadline (sponsor rule, S5 US7)", () => {
    const info = getDeadlineInfo("FL", "2026-10-14");
    assert.equal(info.kind, "none");
    assert.equal(info.date, null);
    assert.equal(deadlineLabel("FL"), NO_STATUTORY_DEADLINE_LABEL);
  });

  it("HI: 10 business days to respond (sponsor rule, S5 US7)", () => {
    // Wed 10/14: 15, 16, 19, 20, 21, 22, 23, 26, 27, 28
    const info = getDeadlineInfo("HI", "2026-10-14");
    assert.equal(info.kind, "statutory");
    assert.equal(info.date, "2026-10-28");
    assert.equal(deadlineLabel("HI"), "10 Business Days To Respond*");
  });

  it("ME: 5 business days to acknowledge", () => {
    // Wed 10/14: 15, 16, (weekend), 19, 20, 21
    assert.equal(getDeadlineInfo("ME", "2026-10-14").date, "2026-10-21");
    assert.equal(deadlineLabel("ME"), "5 Business Days To Acknowledge*");
  });

  it("MN: no statutory deadline", () => {
    const info = getDeadlineInfo("MN", "2026-10-14");
    assert.equal(info.kind, "none");
    assert.equal(info.date, null);
    assert.equal(deadlineLabel("MN"), NO_STATUTORY_DEADLINE_LABEL);
  });

  it("TX: 10 business days to respond", () => {
    // Wed 10/14: 15, 16, 19, 20, 21, 22, 23, 26, 27, 28
    assert.equal(getDeadlineInfo("TX", "2026-10-14").date, "2026-10-28");
    assert.equal(deadlineLabel("TX"), "10 Business Days To Respond*");
  });
});

describe("calculateDeadline (value saved to requests.deadline)", () => {
  it("saves statutory dates", () => {
    assert.equal(calculateDeadline("CA", "2026-10-05"), "2026-10-15");
    assert.equal(calculateDeadline("TX", "2026-10-14"), "2026-10-28");
  });

  it("stores no date for a state with no statutory deadline", () => {
    for (const state of ["AZ", "FL", "MN"]) {
      assert.equal(calculateDeadline(state, "2026-10-14"), null, state);
    }
  });
});

describe("state list", () => {
  it("every state in the form has a deadline rule, and every rule is in the form", () => {
    assert.deepEqual(
      STATES.map((s) => s.code).sort(),
      Object.keys(STATE_DEADLINE_RULES).sort()
    );
  });
});

describe("adjustments", () => {
  it("extend adds days after the base deadline", () => {
    const info = getDeadlineInfo("CA", "2026-10-05", [
      { type: "extend", days: 14, dayType: "calendar", reason: "test" },
    ]);
    assert.equal(info.baseDate, "2026-10-15");
    assert.equal(info.date, "2026-10-29");
    assert.equal(info.adjustments.length, 1);
  });

  it("pause adds the paused calendar days", () => {
    const info = getDeadlineInfo("CA", "2026-10-05", [
      { type: "pause", from: "2026-10-07", to: "2026-10-10", reason: "test" },
    ]);
    assert.equal(info.date, "2026-10-18");
  });

  it("set replaces the date", () => {
    const info = getDeadlineInfo("TX", "2026-10-14", [
      { type: "set", date: "2026-11-30", reason: "test" },
    ]);
    assert.equal(info.date, "2026-11-30");
  });

  it("malformed adjustments are ignored", () => {
    const info = getDeadlineInfo("CA", "2026-10-05", [
      { type: "extend", days: 0, dayType: "calendar" },
      { type: "pause", from: "2026-10-10", to: "2026-10-07" },
      { type: "set", date: "11/30/2026" },
      { type: "unknown" },
    ]);
    assert.equal(info.date, "2026-10-15");
    assert.equal(info.adjustments.length, 0);
  });
});

describe("businessDaysBetween", () => {
  it("counts weekdays after `from` through `to`", () => {
    assert.equal(businessDaysBetween("2026-10-14", "2026-10-21"), 5);
    assert.equal(businessDaysBetween("2026-10-14", "2026-10-14"), 0);
    assert.equal(businessDaysBetween("2026-10-21", "2026-10-14"), -5);
  });
});

describe("research table coverage", () => {
  for (const [state, rule] of Object.entries(STATE_DEADLINE_RULES)) {
    it(`${state} has a statute, citation and source link`, () => {
      assert.ok(rule.statuteName, "missing statuteName");
      assert.ok(rule.citation, "missing citation");
      assert.match(rule.sourceUrl ?? "", /^https:\/\//, "sourceUrl must start with https://");
    });

    it(`${state} has a valid deadline shape`, () => {
      assert.ok(["fixed", "prompt", "none"].includes(rule.deadlineType));
      assert.ok(["acknowledgment", "determination", "production"].includes(rule.measures));
      if (rule.deadlineType === "fixed") {
        assert.ok(rule.days > 0, "fixed rule needs days");
        assert.ok(["calendar", "business"].includes(rule.dayType));
      }
    });
  }
});

describe("bad input", () => {
  it("unknown state is unsupported", () => {
    const info = getDeadlineInfo("ZZ", "2026-10-14");
    assert.equal(info.kind, "unsupported");
    assert.equal(info.date, null);
    assert.equal(calculateDeadline("ZZ", "2026-10-14"), null);
    assert.equal(deadlineLabel("ZZ"), NOT_SUPPORTED_LABEL);
  });

  it("malformed date is not_sent", () => {
    assert.equal(getDeadlineInfo("CA", "10/14/2026").kind, "not_sent");
    assert.equal(calculateDeadline("CA", "10/14/2026"), null);
  });
});
