/**
 * Скриншоты приложения для визуальной проверки.
 * Запуск: npm run preview (отдельно) && node scripts/shots.mjs
 */
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const EXE =
  process.env.CHROMIUM_PATH ??
  `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`
const BASE = process.env.APP_URL ?? 'http://localhost:4173'
const OUT = 'shots'

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch({ executablePath: EXE, headless: true })

function watch(page, label) {
  page.on('console', (message) => {
    if (message.type() === 'error') console.log(`[${label}][console]`, message.text())
  })
  page.on('pageerror', (error) => console.log(`[${label}][error]`, error.message))
}

// --- Мобильный экран ---
const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  locale: 'ru-RU',
})
const page = await mobile.newPage()
watch(page, 'mobile')

async function closeLayer(page) {
  await page.keyboard.press('Escape')
  await page
    .waitForFunction(() => document.querySelectorAll('[role="dialog"]').length === 0, null, {
      timeout: 8000,
    })
    .catch(() => {})
  await page.waitForTimeout(400)
}

await page.goto(BASE, { waitUntil: 'networkidle' })
await page.screenshot({ path: `${OUT}/1-mobile-empty.png`, fullPage: true })

await page.getByRole('button', { name: /Загрузить примеры/ }).click()
await page.waitForTimeout(500)
await page.screenshot({ path: `${OUT}/2-mobile-home.png`, fullPage: true })

await page.getByText('Долг Андрею').first().click()
await page.waitForTimeout(700)
await page.screenshot({ path: `${OUT}/3-mobile-detail.png` })

await closeLayer(page)

await page.getByRole('button', { name: /Внести платёж/ }).first().click()
await page.waitForTimeout(600)
await page.screenshot({ path: `${OUT}/4-mobile-payment.png` })

await closeLayer(page)

await page.getByRole('button', { name: 'История', exact: true }).click()
await page.waitForTimeout(400)
await page.screenshot({ path: `${OUT}/5-mobile-history.png` })

await page.getByRole('button', { name: 'Настройки', exact: true }).click()
await page.waitForTimeout(400)
await page.screenshot({ path: `${OUT}/6-mobile-settings.png`, fullPage: true })

// Форма нового долга (полноэкранная на мобилке)
await page.getByRole('button', { name: 'Главная', exact: true }).click()
await page.waitForTimeout(300)
await page.getByRole('button', { name: 'Добавить долг' }).first().click()
await page.waitForTimeout(600)
await page.screenshot({ path: `${OUT}/7-mobile-form.png` })

await closeLayer(page)

// --- Десктоп ---
const desktop = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: 'ru-RU',
})
const deskPage = await desktop.newPage()
watch(deskPage, 'desktop')
await deskPage.goto(BASE, { waitUntil: 'networkidle' })
await deskPage.getByRole('button', { name: /Загрузить примеры/ }).click()
await deskPage.waitForTimeout(500)
await deskPage.screenshot({ path: `${OUT}/8-desktop-home.png`, fullPage: true })

await deskPage.getByText('Кирилл должен').first().click()
await deskPage.waitForTimeout(700)
await deskPage.screenshot({ path: `${OUT}/9-desktop-detail.png` })

await browser.close()
console.log('Скриншоты сохранены в', OUT)
