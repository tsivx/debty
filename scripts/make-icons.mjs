/**
 * Генерирует PNG-иконки PWA из public/icon.svg.
 * Запуск: node scripts/make-icons.mjs
 */
import { mkdir } from 'node:fs/promises'
import sharp from 'sharp'

const SOURCE = 'public/icon.svg'
const OUT = 'public/icons'
const BACKGROUND = '#0f172a'

await mkdir(OUT, { recursive: true })

const full = await sharp(SOURCE).resize(512, 512).png().toBuffer()

await sharp(full).resize(192, 192).png().toFile(`${OUT}/icon-192.png`)
await sharp(full).resize(512, 512).png().toFile(`${OUT}/icon-512.png`)

// Maskable: значок уменьшаем, фон — сплошной (безопасная зона 80%)
const maskableBg = await sharp({
  create: { width: 512, height: 512, channels: 4, background: BACKGROUND },
})
  .png()
  .toBuffer()
const maskableGlyph = await sharp(SOURCE).resize(400, 400).png().toBuffer()
await sharp(maskableBg)
  .composite([{ input: maskableGlyph, gravity: 'center' }])
  .png()
  .toFile(`${OUT}/maskable-512.png`)

// iOS: квадрат без прозрачности
const appleGlyph = await sharp(SOURCE).resize(430, 430).png().toBuffer()
const appleFull = await sharp(maskableBg)
  .composite([{ input: appleGlyph, gravity: 'center' }])
  .png()
  .toBuffer()
await sharp(appleFull).resize(180, 180).png().toFile(`${OUT}/apple-touch-icon.png`)

console.log('Иконки готовы:', OUT)
