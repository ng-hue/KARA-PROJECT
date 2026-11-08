import test from "node:test";
import assert from "node:assert/strict";

import {
  ATTACHMENT_MAX_BYTES,
  formatFileSize,
  getFileExtension,
  validateAttachment,
} from "./attachmentRules.js";

function fakeFile(name, type, size) {
  return {
    name,
    type,
    size,
  };
}

test("no attachment is allowed", () => {
  assert.equal(validateAttachment(null), "");
});

test("accepts a PDF under 10 MB", () => {
  const file = fakeFile(
    "agency-response.pdf",
    "application/pdf",
    2 * 1024 * 1024
  );

  assert.equal(validateAttachment(file), "");
});

test("accepts PNG, JPG, and DOCX files", () => {
  const files = [
    fakeFile("scan.png", "image/png", 1000),
    fakeFile("letter.jpg", "image/jpeg", 1000),
    fakeFile(
      "response.docx",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      1000
    ),
  ];

  for (const file of files) {
    assert.equal(validateAttachment(file), "");
  }
});

test("rejects files over 10 MB", () => {
  const file = fakeFile(
    "large.pdf",
    "application/pdf",
    ATTACHMENT_MAX_BYTES + 1
  );

  assert.equal(
    validateAttachment(file),
    "File must be 10 MB or smaller."
  );
});

test("rejects unsupported file extensions", () => {
  const file = fakeFile(
    "malware.exe",
    "application/octet-stream",
    1000
  );

  assert.equal(
    validateAttachment(file),
    "File must be a PDF, PNG, JPG, or DOCX."
  );
});

test("rejects unsupported MIME types", () => {
  const file = fakeFile(
    "fake.pdf",
    "application/octet-stream",
    1000
  );

  assert.equal(
    validateAttachment(file),
    "File must be a PDF, PNG, JPG, or DOCX."
  );
});

test("gets lowercase file extension", () => {
  assert.equal(getFileExtension("Letter.PDF"), ".pdf");
  assert.equal(getFileExtension("response.DOCX"), ".docx");
});

test("formats file sizes for display", () => {
  assert.equal(formatFileSize(500), "500 B");
  assert.equal(formatFileSize(2048), "2.0 KB");
  assert.equal(formatFileSize(2 * 1024 * 1024), "2.0 MB");
});