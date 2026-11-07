import { chromium } from 'playwright-core'

const EXE = `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`
const URL = process.env.APP_URL ?? 'https://tsivx.github.io/debty/'

const browser = await chromium.launch({ executablePath: EXE, headless: true })
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'ru-RU' })
const page = await ctx.newPage()
const errors = []
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', (e) => errors.push(e.message))

await page.goto(URL, { waitUntil: 'networkidle' })
console.log('title:', await page.title())
console.log('header:', await page.locator('h1').first().textContent())

await page.getByRole('button', { name: /Загрузить примеры/ }).click()
await page.waitForTimeout(600)
console.log('cards:', await page.locator('article').count())
console.log('sw:', await page.evaluate(() => navigator.serviceWorker?.controller ? 'active' : 'none'))

await page.getByRole('button', { name: 'Настройки', exact: true }).click()
await page.waitForTimeout(400)
console.log('settings:', await page.getByText('Внешний вид').count())

console.log('console errors:', errors.length ? errors : 'нет')
await browser.close()
