export interface LoadedPdfLogo {
  dataUrl: string
  width: number
  height: number
  aspectRatio: number
}

const OFFICIAL_LOGO_PATH = "/images/logo-bbpst-kemendikdasmen.png"

/**
 * Memuat logo resmi Kemendikdasmen - BBPST menjadi PNG Data URL beserta rasio aslinya
 * agar dimensi gambar pada jsPDF dan HTML5 Canvas selalu proporsional tanpa distorsi.
 */
export async function loadOfficialLogoForExport(): Promise<LoadedPdfLogo | null> {
  if (typeof window === "undefined") return null

  return new Promise((resolve) => {
    const img = new window.Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      try {
        const w = img.naturalWidth || 1024
        const h = img.naturalHeight || 194
        const canvas = document.createElement("canvas")
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          resolve(null)
          return
        }
        ctx.drawImage(img, 0, 0, w, h)
        resolve({
          dataUrl: canvas.toDataURL("image/png"),
          width: w,
          height: h,
          aspectRatio: w / h,
        })
      } catch {
        resolve(null)
      }
    }
    img.onerror = () => resolve(null)
    img.src = OFFICIAL_LOGO_PATH
  })
}
