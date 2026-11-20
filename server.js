const { createServer } = require("http")
const { parse } = require("url")
const next = require("next")

const dev = false
const hostname = process.env.HOSTNAME || "0.0.0.0"
const port = parseInt(process.env.PORT || "3000", 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app
  .prepare()
  .then(() => {
    createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url || "/", true)
        await handle(req, res, parsedUrl)
      } catch (err) {
        console.error("Kesalahan menangani permintaan HTTP:", err)
        res.statusCode = 500
        res.end("Internal Server Error")
      }
    }).listen(port, () => {
      console.log(`> Server LMS BAHASA & KARAKTER siap pada port ${port} (${process.env.NODE_ENV || "production"})`)
    })
  })
  .catch((err) => {
    console.error("Gagal memulai aplikasi Next.js:", err)
    process.exit(1)
  })
