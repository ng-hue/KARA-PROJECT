export const ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;
export const ATTACHMENT_MAX_LABEL = "10 MB";
export const ATTACHMENT_BUCKET = "correspondence-files";

export const ALLOWED_ATTACHMENT_EXTENSIONS = [
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".docx",
];

export const ALLOWED_ATTACHMENT_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MIME_TYPE_BY_EXTENSION = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export const ATTACHMENT_ACCEPT =
  ".pdf,.png,.jpg,.jpeg,.docx,application/pdf,image/png,image/jpeg,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export function getFileExtension(filename = "") {
  const dotIndex = filename.lastIndexOf(".");

  if (dotIndex === -1) {
    return "";
  }

  return filename.slice(dotIndex).toLowerCase();
}

export function getAttachmentContentType(file) {
  return MIME_TYPE_BY_EXTENSION[getFileExtension(file?.name)] || "";
}

export function buildAttachmentPath(requestId, correspondenceId, filename) {
  const safeFilename = filename
    .split(/[\\/]/)
    .pop()
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim();

  if (!safeFilename || safeFilename === "." || safeFilename === "..") {
    throw new Error("Attachment must have a valid file name.");
  }

  return `${requestId}/${correspondenceId}/${safeFilename}`;
}

export function validateAttachment(file) {
  if (!file) {
    return "";
  }

  if (file.size > ATTACHMENT_MAX_BYTES) {
    return `File must be ${ATTACHMENT_MAX_LABEL} or smaller.`;
  }

  const extension = getFileExtension(file.name);

  if (!ALLOWED_ATTACHMENT_EXTENSIONS.includes(extension)) {
    return "File must be a PDF, PNG, JPG, or DOCX.";
  }

  if (
    file.type &&
    !ALLOWED_ATTACHMENT_TYPES.includes(file.type)
  ) {
    return "File must be a PDF, PNG, JPG, or DOCX.";
  }

  return "";
}

export function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return "";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}