// Correspondence entry rules for S4 US2 (SCRUM-210). Run with: npm test

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  SUMMARY_MAX_LENGTH,
  parseUsDate,
  validateCorrespondence,
} from "./correspondenceRules.js";

const valid = {
  direction: "incoming",
  correspondence_date: "10/14/2026",
  sender: "Records Officer, Fictional Texas Records Office",
  summary: "Agency acknowledged the request.",
};

describe("parseUsDate", () => {
  it("turns MM/DD/YYYY into YYYY-MM-DD", () => {
    assert.equal(parseUsDate("10/14/2026"), "2026-10-14");
    assert.equal(parseUsDate(" 02/29/2028 "), "2028-02-29");
  });

  it("rejects dates that do not exist or are in another format", () => {
    assert.equal(parseUsDate("02/30/2026"), null);
    assert.equal(parseUsDate("02/29/2026"), null);
    assert.equal(parseUsDate("13/01/2026"), null);
    assert.equal(parseUsDate("2026-10-14"), null);
    assert.equal(parseUsDate("10/14/26"), null);
    assert.equal(parseUsDate(""), null);
    assert.equal(parseUsDate(undefined), null);
  });
});

describe("validateCorrespondence", () => {
  it("a complete entry has no errors", () => {
    assert.deepEqual(validateCorrespondence(valid), {});
  });

  it("all four fields are required", () => {
    const errors = validateCorrespondence({ direction: "", correspondence_date: "", sender: " ", summary: "" });
    assert.deepEqual(Object.keys(errors).sort(), ["correspondence_date", "direction", "sender", "summary"]);
  });

  it("empty sender is an error (S4 US2 missing field test)", () => {
    assert.equal(validateCorrespondence({ ...valid, sender: "" }).sender, "Enter the sender.");
  });

  it("direction must be outgoing or incoming", () => {
    assert.ok(validateCorrespondence({ ...valid, direction: "sideways" }).direction);
  });

  it("date must be a real MM/DD/YYYY date", () => {
    assert.equal(
      validateCorrespondence({ ...valid, correspondence_date: "2026-10-14" }).correspondence_date,
      "Enter the date as MM/DD/YYYY."
    );
  });

  it(`summary is capped at ${SUMMARY_MAX_LENGTH} characters`, () => {
    assert.deepEqual(validateCorrespondence({ ...valid, summary: "a".repeat(SUMMARY_MAX_LENGTH) }), {});
    assert.ok(validateCorrespondence({ ...valid, summary: "a".repeat(SUMMARY_MAX_LENGTH + 1) }).summary);
  });
});
