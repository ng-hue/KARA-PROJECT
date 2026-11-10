import test from "node:test";
import assert from "node:assert/strict";

import {
  getAllowedNextStatuses,
  canTransitionStatus,
} from "./statusTransitions.js";

test("Draft can only move to Sent", () => {
  assert.deepEqual(getAllowedNextStatuses("Draft"), ["Sent"]);
});

test("Sent can move to Acknowledged, Fulfilled, or Denied", () => {
  assert.deepEqual(getAllowedNextStatuses("Sent"), [
    "Acknowledged",
    "Fulfilled",
    "Denied",
  ]);
});

test("Acknowledged can move to Fulfilled or Denied", () => {
  assert.deepEqual(getAllowedNextStatuses("Acknowledged"), [
    "Fulfilled",
    "Denied",
  ]);
});

test("Denied can move to Appealed", () => {
  assert.deepEqual(getAllowedNextStatuses("Denied"), ["Appealed"]);
});

test("Fulfilled is terminal", () => {
  assert.deepEqual(getAllowedNextStatuses("Fulfilled"), []);
});

test("Appealed is terminal", () => {
  assert.deepEqual(getAllowedNextStatuses("Appealed"), []);
});

test("backwards transitions are rejected", () => {
  assert.equal(canTransitionStatus("Sent", "Draft"), false);
  assert.equal(canTransitionStatus("Acknowledged", "Sent"), false);
  assert.equal(canTransitionStatus("Denied", "Sent"), false);
});

test("invalid status returns no transitions", () => {
  assert.deepEqual(getAllowedNextStatuses("Unknown"), []);
});