export interface QuickReadingCheck {
  question: string
  options: [string, string, string]
  correctIndex: number
}

function cleanPlainText(raw: string): string {
  if (!raw) return ""
  return raw
    .replace(/<[^>]+>/g, " ")
    .replace(/[*_`>#]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function truncateAtWord(text: string, maxLen: number): string {
  const cleaned = text.trim()
  if (cleaned.length <= maxLen) return cleaned
  const sliced = cleaned.slice(0, maxLen)
  const lastSpace = sliced.lastIndexOf(" ")
  return (lastSpace > 20 ? sliced.slice(0, lastSpace) : sliced).trim() + "..."
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

interface TermEntry {
  term: string
  explanation: string
}

function extractTermEntries(contentBody: string): TermEntry[] {
  const lines = contentBody.split("\n")
  const entries: TermEntry[] = []

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!/^[-*•]|\d+\./.test(line)) continue
    const content = line.replace(/^[-*•]\s*|\d+\.\s*/, "").replace(/\*\*/g, "").trim()
    const colonIdx = content.indexOf(":")
    if (colonIdx > 2 && colonIdx < 50) {
      const term = content.slice(0, colonIdx).trim()
      const explanation = cleanPlainText(content.slice(colonIdx + 1))
      if (term.length >= 3 && explanation.length >= 20) {
        entries.push({ term, explanation })
      }
    }
  }

  return entries
}

function extractSentences(text: string): string[] {
  const plain = cleanPlainText(text)
  return plain
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 45 && s.length <= 220)
}

/**
 * Menyusun 1 pertanyaan cek pemahaman objektif beserta 3 pilihan jawaban
 * berdasarkan kalimat/poin inti materi yang sedang dibaca siswa.
 */
export function generateQuickReadingCheck(
  title: string,
  summary: string,
  contentBody: string
): QuickReadingCheck {
  const seed = hashString(title + summary)
  const entries = extractTermEntries(contentBody)

  let question = ""
  let correctAnswer = ""
  let distractor1 = ""
  let distractor2 = ""

  if (entries.length >= 3) {
    const targetIdx = seed % entries.length
    const target = entries[targetIdx]
    const other1 = entries[(targetIdx + 1) % entries.length]
    const other2 = entries[(targetIdx + 2) % entries.length]

    question = `Berdasarkan materi "${title}", manakah penjelasan yang tepat mengenai "${target.term}"?`
    correctAnswer = truncateAtWord(target.explanation, 130)
    distractor1 = truncateAtWord(other1.explanation, 130)
    distractor2 = truncateAtWord(other2.explanation, 130)
  } else if (entries.length >= 1) {
    const target = entries[0]
    question = `Berdasarkan bacaan "${title}", apa inti penjelasan mengenai "${target.term}"?`
    correctAnswer = truncateAtWord(target.explanation, 130)
    distractor1 = `Merupakan istilah yang tidak berkaitan dengan pembahasan "${target.term}" dalam bacaan.`
    distractor2 = `Aturan yang melarang penerapan "${target.term}" dalam pembelajaran bahasa dan karakter.`
  } else {
    const sentences = extractSentences(contentBody)
    const coreSentence =
      sentences[seed % Math.max(1, sentences.length)] || cleanPlainText(summary) || title

    question = `Manakah pernyataan yang sesuai dengan gagasan inti dalam materi "${title}"?`
    correctAnswer = truncateAtWord(coreSentence, 135)
    distractor1 = `Materi ini menyatakan bahwa pembahasan tentang "${title}" tidak perlu diterapkan dalam kehidupan sehari-hari.`
    distractor2 = `Bacaan di atas berfokus pada pembahasan teknologi luar angkasa dan tidak menyinggung "${title}".`
  }

  // Pastikan seluruh 3 opsi unik
  if (distractor1 === correctAnswer) {
    distractor1 = `Pernyataan yang berlawanan dengan prinsip utama dalam materi "${title}".`
  }
  if (distractor2 === correctAnswer || distractor2 === distractor1) {
    distractor2 = `Topik yang tidak dibahas di dalam modul "${title}".`
  }

  const taggedOptions = [
    { text: correctAnswer, isCorrect: true },
    { text: distractor1, isCorrect: false },
    { text: distractor2, isCorrect: false },
  ]

  // Acak urutan secara deterministik agar kunci jawaban tidak selalu di posisi A
  const shift = seed % 3
  const rotated = [
    taggedOptions[shift],
    taggedOptions[(shift + 1) % 3],
    taggedOptions[(shift + 2) % 3],
  ]

  const correctIndex = rotated.findIndex((o) => o.isCorrect)

  return {
    question,
    options: [rotated[0].text, rotated[1].text, rotated[2].text],
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
  }
}
