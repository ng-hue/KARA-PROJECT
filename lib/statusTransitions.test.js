import test from "node:test";
import assert from "node:assert/strict";

import {
  getAllowedNextStatuses,
  canTransitionStatus,
} from "./statusTransitions.js";

test("Drafted can move to Sent or Withdrawn", () => {
  assert.deepEqual(getAllowedNextStatuses("Drafted"), [
    "Sent",
    "Withdrawn",
  ]);
});

test("Sent can move to the allowed response statuses", () => {
  assert.deepEqual(getAllowedNextStatuses("Sent"), [
    "Acknowledged",
    "Provided",
    "Partial",
    "Refused",
    "No response by deadline",
    "Withdrawn",
  ]);
});

test("Acknowledged can move to the allowed response statuses", () => {
  assert.deepEqual(getAllowedNextStatuses("Acknowledged"), [
    "Provided",
    "Partial",
    "Refused",
    "No response by deadline",
    "Withdrawn",
  ]);
});

test("Partial can continue to a final status", () => {
  assert.deepEqual(getAllowedNextStatuses("Partial"), [
    "Provided",
    "Refused",
    "No response by deadline",
    "Withdrawn",
  ]);
});

test("Provided is terminal", () => {
  assert.deepEqual(getAllowedNextStatuses("Provided"), []);
});

test("Refused is terminal", () => {
  assert.deepEqual(getAllowedNextStatuses("Refused"), []);
});

test("No response by deadline is terminal", () => {
  assert.deepEqual(
    getAllowedNextStatuses("No response by deadline"),
    []
  );
});

test("Withdrawn is terminal", () => {
  assert.deepEqual(getAllowedNextStatuses("Withdrawn"), []);
});

test("backwards transitions are rejected", () => {
  assert.equal(canTransitionStatus("Sent", "Drafted"), false);
  assert.equal(canTransitionStatus("Acknowledged", "Sent"), false);
  assert.equal(canTransitionStatus("Partial", "Acknowledged"), false);
});

test("invalid status returns no transitions", () => {
  assert.deepEqual(getAllowedNextStatuses("Unknown"), []);
});