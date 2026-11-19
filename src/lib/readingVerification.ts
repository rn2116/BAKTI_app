import { createHmac, timingSafeEqual } from "crypto"

const SECRET = process.env.JWT_SECRET ?? "development-secret-change-me"

interface ReadingTokenPayload {
  userId: string
  materialId: string
  issuedAt: number
}

function signPayload(encodedPayload: string): string {
  return createHmac("sha256", SECRET).update(encodedPayload).digest("base64url")
}

/**
 * Membuat token sesi baca bertanda tangan HMAC saat materi dibuka di server
 * untuk memvalidasi waktu mulai membaca asli tanpa manipulasi sisi klien.
 */
export function createReadingStartToken(userId: string, materialId: string): string {
  const payload: ReadingTokenPayload = {
    userId,
    materialId,
    issuedAt: Date.now(),
  }
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url")
  const signature = signPayload(encoded)
  return `${encoded}.${signature}`
}

/**
 * Memverifikasi keabsahan token sesi baca dan memastikan durasi baca minimal terpenuhi.
 */
export function verifyReadingStartToken(
  token: string,
  expectedUserId: string,
  expectedMaterialId: string
): { valid: boolean; issuedAt?: number; error?: string } {
  if (!token || !token.includes(".")) {
    return { valid: false, error: "Token verifikasi bacaan tidak valid." }
  }

  const parts = token.split(".")
  if (parts.length !== 2) {
    return { valid: false, error: "Format token verifikasi bacaan tidak valid." }
  }

  const [encoded, signature] = parts
  const expectedSignature = signPayload(encoded)

  const sigBuf = Buffer.from(signature, "utf8")
  const expectedBuf = Buffer.from(expectedSignature, "utf8")
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return { valid: false, error: "Tanda tangan token verifikasi bacaan tidak sah." }
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    ) as ReadingTokenPayload

    if (parsed.userId !== expectedUserId || parsed.materialId !== expectedMaterialId) {
      return { valid: false, error: "Token verifikasi tidak sesuai dengan materi atau pengguna." }
    }

    if (typeof parsed.issuedAt !== "number" || !Number.isFinite(parsed.issuedAt)) {
      return { valid: false, error: "Timestamp bacaan tidak valid." }
    }

    return { valid: true, issuedAt: parsed.issuedAt }
  } catch {
    return { valid: false, error: "Gagal membaca token verifikasi bacaan." }
  }
}
