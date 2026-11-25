import net from "net"
import tls from "tls"

interface SendEmailOptions {
  to: string
  subject: string
  textBody: string
}

async function sendSmtpCommand(
  socket: net.Socket | tls.TLSSocket,
  command?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const onData = (chunk: Buffer) => {
      const text = chunk.toString("utf8")
      socket.off("error", onError)
      resolve(text)
    }
    const onError = (err: Error) => {
      socket.off("data", onData)
      reject(err)
    }
    socket.once("data", onData)
    socket.once("error", onError)
    if (command !== undefined) {
      socket.write(`${command}\r\n`)
    }
  })
}

/**
 * Mengirim pemberitahuan surel otomatis ke kontak resmi BBPST jika konfigurasi SMTP tersedia di .env.
 */
export async function sendBbpstNotificationEmail(
  options: SendEmailOptions
): Promise<{ sent: boolean; skippedReason?: string }> {
  const host = process.env.SMTP_HOST?.trim()
  const user = process.env.SMTP_USER?.trim()
  const pass = process.env.SMTP_PASS?.trim()
  const port = parseInt(process.env.SMTP_PORT || "465", 10)
  const from = process.env.SMTP_FROM?.trim() || user

  if (!host || !user || !pass || !from) {
    return { sent: false, skippedReason: "SMTP tidak dikonfigurasi pada .env" }
  }

  let socket: net.Socket | tls.TLSSocket | null = null
  try {
    socket = await new Promise<net.Socket | tls.TLSSocket>((resolve, reject) => {
      const client =
        port === 465
          ? tls.connect({ host, port, rejectUnauthorized: false }, () => resolve(client))
          : net.connect({ host, port }, () => resolve(client))
      client.setTimeout(6000, () => {
        client.destroy(new Error("SMTP timeout"))
      })
      client.once("error", reject)
    })

    await sendSmtpCommand(socket)
    await sendSmtpCommand(socket, `EHLO localhost`)
    await sendSmtpCommand(socket, `AUTH LOGIN`)
    await sendSmtpCommand(socket, Buffer.from(user).toString("base64"))
    const authRes = await sendSmtpCommand(socket, Buffer.from(pass).toString("base64"))
    if (!authRes.startsWith("235")) {
      throw new Error(`Autentikasi SMTP ditolak: ${authRes.trim()}`)
    }

    await sendSmtpCommand(socket, `MAIL FROM:<${from}>`)
    await sendSmtpCommand(socket, `RCPT TO:<${options.to}>`)
    await sendSmtpCommand(socket, `DATA`)

    const message = [
      `From: "LMS BAHASA & KARAKTER BBPST" <${from}>`,
      `To: <${options.to}>`,
      `Subject: ${options.subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/plain; charset=UTF-8`,
      ``,
      options.textBody,
      `.`,
    ].join("\r\n")

    await sendSmtpCommand(socket, message)
    await sendSmtpCommand(socket, `QUIT`).catch(() => "")
    socket.end()
    return { sent: true }
  } catch (err) {
    console.warn("Pemberitahuan surel SMTP tidak terkirim:", err)
    socket?.destroy()
    return { sent: false, skippedReason: "Gagal terhubung ke server SMTP" }
  }
}
