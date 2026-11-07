import { chromium } from 'playwright-core'

const EXE = `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`
const browser = await chromium.launch({ executablePath: EXE, headless: true })
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'ru-RU' })
const page = await ctx.newPage()
page.on('pageerror', (e) => console.log('[pageerror]', e.message))

const dialogs = () => page.locator('[role="dialog"]').count()
const tabs = () => page.getByRole('button', { name: 'История', exact: true }).count()

await page.goto('http://localhost:4173', { waitUntil: 'networkidle' })
await page.getByRole('button', { name: /Загрузить примеры/ }).click()
await page.waitForTimeout(300)

await page.getByText('Долг Андрею').first().click()
await page.waitForTimeout(600)
console.log('после открытия деталей: dialogs=', await dialogs(), 'tabs=', await tabs())

await page.keyboard.press('Escape')
await page.waitForTimeout(800)
console.log('после Escape: dialogs=', await dialogs(), 'tabs=', await tabs())

if ((await dialogs()) > 0) {
  const close = page.locator('[role="dialog"] button[aria-label="Закрыть"]').first()
  console.log('кнопка закрыть видима:', await close.isVisible().catch(() => false))
  await close.click()
  await page.waitForTimeout(800)
  console.log('после клика по X: dialogs=', await dialogs(), 'tabs=', await tabs())
}

const pay = page.getByRole('button', { name: /Внести платёж/ })
console.log('кнопок «Внести платёж»:', await pay.count())
await pay.first().click()
await page.waitForTimeout(600)
console.log('после открытия платежа: dialogs=', await dialogs(), 'tabs=', await tabs())

await browser.close()
