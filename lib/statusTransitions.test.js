import test from "node:test";
import assert from "node:assert/strict";

import {
  canTransitionStatus,
  getAllowedNextStatuses,
} from "./statusTransitions.js";

test("Drafted can move to Sent or Withdrawn", () => {
  assert.deepEqual(
    getAllowedNextStatuses("Drafted"),
    [
      "Sent",
      "Withdrawn",
    ]
  );
});

test("Sent can move to the allowed response statuses", () => {
  assert.deepEqual(
    getAllowedNextStatuses("Sent"),
    [
      "Acknowledged",
      "Provided",
      "Partial",
      "Refused",
      "No response by deadline",
      "Withdrawn",
    ]
  );
});

test("Acknowledged can move to the allowed response statuses", () => {
  assert.deepEqual(
    getAllowedNextStatuses("Acknowledged"),
    [
      "Provided",
      "Partial",
      "Refused",
      "No response by deadline",
      "Withdrawn",
    ]
  );
});

test("Partial can move to Provided, Refused, or Withdrawn", () => {
  assert.deepEqual(
    getAllowedNextStatuses("Partial"),
    [
      "Provided",
      "Refused",
      "Withdrawn",
    ]
  );
});

test("No response by deadline can move to allowed response statuses", () => {
  assert.deepEqual(
    getAllowedNextStatuses("No response by deadline"),
    [
      "Acknowledged",
      "Provided",
      "Partial",
      "Refused",
      "Withdrawn",
    ]
  );
});

test("Provided is terminal", () => {
  assert.deepEqual(
    getAllowedNextStatuses("Provided"),
    []
  );
});

test("Refused is terminal", () => {
  assert.deepEqual(
    getAllowedNextStatuses("Refused"),
    []
  );
});

test("Withdrawn is terminal", () => {
  assert.deepEqual(
    getAllowedNextStatuses("Withdrawn"),
    []
  );
});

test("invalid transitions are rejected", () => {
  assert.equal(
    canTransitionStatus("Drafted", "Provided"),
    false
  );

  assert.equal(
    canTransitionStatus(
      "Partial",
      "No response by deadline"
    ),
    false
  );

  assert.equal(
    canTransitionStatus("Provided", "Sent"),
    false
  );
});

test("invalid status returns no transitions", () => {
  assert.deepEqual(
    getAllowedNextStatuses("Unknown"),
    []
  );
});