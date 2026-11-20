/**
 * Membersihkan teks masukan dari tag HTML/skrip berbahaya serta karakter kontrol tersembunyi.
 */
export function sanitizePlainText(input: unknown, maxLength = 2000): string {
  const raw = typeof input === "string" ? input : String(input ?? "")
  const withoutScripts = raw
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<\/?[^>]+(>|$)/g, "")
  const withoutControlChars = withoutScripts.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
  return withoutControlChars.replace(/\s+/g, " ").trim().slice(0, maxLength)
}

/**
 * Memvalidasi dan membersihkan URL audio agar hanya mengizinkan path lokal internal atau HTTPS aman.
 */
export function sanitizeAudioUrl(input: unknown): string | null {
  if (typeof input !== "string") return null
  const trimmed = input.trim()
  if (!trimmed) return null

  const lower = trimmed.toLowerCase()
  if (lower.startsWith("javascript:") || lower.startsWith("data:") || lower.startsWith("vbscript:")) {
    return null
  }

  if (
    trimmed.startsWith("/api/audio/") ||
    trimmed.startsWith("/uploads/audio/") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://")
  ) {
    return trimmed.slice(0, 1000)
  }

  return null
}
