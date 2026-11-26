import { mkdir, readFile, stat, writeFile } from "fs/promises"
import path from "path"
import { BlobError, get, put, type BlobAccessType } from "@vercel/blob"

export type UploadFolder = "audio" | "dokumen-ahli"

export function isVercelBlobEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim())
}

function getLocalFolderPath(folder: UploadFolder): string {
  return path.resolve(process.cwd(), "public", "uploads", folder)
}

function getBlobPathname(folder: UploadFolder, safeFilename: string): string {
  return `${folder}/${safeFilename}`
}

async function readLocalFileBuffer(
  folder: UploadFolder,
  safeFilename: string
): Promise<Buffer | null> {
  const baseDir = getLocalFolderPath(folder)
  const targetPath = path.resolve(baseDir, safeFilename)

  if (!targetPath.startsWith(`${baseDir}${path.sep}`)) {
    throw new Error("Jalur berkas lokal tidak valid.")
  }

  try {
    const fileStat = await stat(targetPath)
    if (!fileStat.isFile()) return null
    return await readFile(targetPath)
  } catch {
    return null
  }
}

export async function saveStoredFile(params: {
  folder: UploadFolder
  safeFilename: string
  buffer: Buffer
  contentType: string
}): Promise<{ storage: "vercel-blob" | "local"; blobUrl?: string }> {
  const { folder, safeFilename, buffer, contentType } = params

  if (isVercelBlobEnabled()) {
    const blobPath = getBlobPathname(folder, safeFilename)
    const primaryAccess: BlobAccessType =
      process.env.VERCEL_BLOB_ACCESS === "private" ? "private" : "public"
    const fallbackAccess: BlobAccessType =
      primaryAccess === "public" ? "private" : "public"

    try {
      const result = await put(blobPath, buffer, {
        access: primaryAccess,
        addRandomSuffix: false,
        contentType,
      })
      return { storage: "vercel-blob", blobUrl: result.url }
    } catch (err) {
      if (err instanceof BlobError) {
        const fallbackResult = await put(blobPath, buffer, {
          access: fallbackAccess,
          addRandomSuffix: false,
          contentType,
        })
        return { storage: "vercel-blob", blobUrl: fallbackResult.url }
      }
      throw err
    }
  }

  const baseDir = getLocalFolderPath(folder)
  await mkdir(baseDir, { recursive: true })
  const targetPath = path.resolve(baseDir, safeFilename)

  if (!targetPath.startsWith(`${baseDir}${path.sep}`)) {
    throw new Error("Jalur penyimpanan berkas tidak valid.")
  }

  await writeFile(targetPath, buffer)
  return { storage: "local" }
}

export async function readStoredFile(
  folder: UploadFolder,
  safeFilename: string
): Promise<Buffer | null> {
  if (isVercelBlobEnabled()) {
    const blobPath = getBlobPathname(folder, safeFilename)
    const preferredOrder: readonly BlobAccessType[] =
      process.env.VERCEL_BLOB_ACCESS === "private"
        ? ["private", "public"]
        : ["public", "private"]

    for (const access of preferredOrder) {
      try {
        const result = await get(blobPath, { access })
        if (result && result.statusCode === 200 && result.stream) {
          const arrayBuffer = await new Response(result.stream).arrayBuffer()
          return Buffer.from(arrayBuffer)
        }
      } catch {
        // Coba mode akses atau fallback lokal berikutnya
      }
    }
  }

  return readLocalFileBuffer(folder, safeFilename)
}
