/**
 * Text and Input Sanitization Utility
 * Mitigates Stored & Reflected XSS attacks, strips null bytes and dangerous control characters,
 * and enforces safe length limits.
 */

export function sanitizeText(input, maxLength = 2000) {
  if (input == null) return "";
  const str = String(input);
  return str
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "") // Strip invisible control characters
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .trim()
    .slice(0, maxLength);
}

export function sanitizeFileName(name) {
  if (!name) return "evidence";
  return String(name)
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/\.{2,}/g, ".") // prevent directory traversal (..)
    .slice(0, 100);
}
