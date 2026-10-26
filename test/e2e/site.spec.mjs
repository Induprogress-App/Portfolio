import { test, expect } from '@playwright/test';

// YouTube blokujemy: testy nie zależą od sieci, a strona ma wtedy zostać przy zdjęciu maszyny.
test.beforeEach(async ({ page }) => {
  await page.route(/youtube(-nocookie)?\.com|ytimg\.com/, route => route.abort());
});

test('strona ładuje się bez błędów i pokazuje 7 realizacji', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await expect(page).toHaveTitle(/Dział Aplikacji/);
  await expect(page.locator('#projects .card')).toHaveCount(7);
  await expect(page.locator('#stats .stat')).toHaveCount(4);
  expect(errors).toEqual([]);
});

test('karty maszyn mają zdjęcie i film producenta, a bez YouTube zostaje zdjęcie', async ({ page }) => {
  await page.goto('/');
  const videos = page.locator('#projects [data-video]');
  await expect(videos).toHaveCount(7);
  const first = videos.first();
  await first.scrollIntoViewIfNeeded();
  await expect(first.locator('img')).toBeVisible();
  await page.waitForTimeout(1500);
  await expect(first).toHaveAttribute('data-preview', 'photo');
});

test('przycisk podglądu wstrzymuje i wznawia animację', async ({ page }) => {
  await page.goto('/');
  const toggle = page.locator('#karta-pila-kamien .preview-toggle');
  await expect(toggle).toHaveText('Wstrzymaj podgląd');
  await toggle.click();
  await expect(toggle).toHaveText('Odtwórz podgląd');
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
});

test('filtr kategorii zawęża listę', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Linie i instalacje/ }).click();
  await expect(page.locator('#projects .card')).toHaveCount(2);
  await page.getByRole('button', { name: /Maszyny seryjne/ }).click();
  await expect(page.locator('#projects .card')).toHaveCount(5);
  await page.getByRole('button', { name: /Wszystkie/ }).click();
  await expect(page.locator('#projects .card')).toHaveCount(7);
});

test('szczegóły: film, schemat sterowania i zamknięcie usuwa film', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-open="nalewarka"]').first().click();
  const modal = page.locator('#modal');
  await expect(modal).toBeVisible();
  await expect(modal.getByRole('heading', { name: 'Nalewarka kosmetyków w małych dawkach' })).toBeVisible();
  await expect(modal.locator('iframe')).toHaveAttribute('src', /youtube-nocookie\.com\/embed\/uNSu2W4lIJ0\?start=25/);
  await expect(modal.locator('svg.schematic')).toBeVisible();
  await expect(modal.locator('.sch-field')).toHaveCount(6);
  await expect(page).toHaveURL(/#nalewarka$/);
  await page.keyboard.press('Escape');
  await expect(modal).toBeHidden();
  await expect(page.locator('#modal-body iframe')).toHaveCount(0);
});

test('link z identyfikatorem otwiera realizację', async ({ page }) => {
  await page.goto('/#zgrzewarki-workow');
  await expect(page.locator('#modal')).toBeVisible();
  await expect(page.locator('#modal iframe')).toHaveAttribute('src', /embed\/r3PvceIGd2I/);
  await expect(page.locator('#modal .modal__photo')).toBeVisible();
});

test('przykłady kodu: zakładki i kod Node.js wczytany z pliku', async ({ page }) => {
  await page.goto('/');
  const panel = page.locator('#code-panel');
  await expect(panel).toContainText('FUNCTION_BLOCK FB_SensorWatch');
  await page.getByRole('tab', { name: /sekwencja cyklu/ }).click();
  await expect(panel).toContainText('CASE eStep OF');
  await page.getByRole('tab', { name: /Node\.js/ }).click();
  await expect(panel).toContainText('export function fefco201');
  await expect(page.locator('#architecture svg.schematic')).toBeVisible();
});

test('demo FEFCO liczy formatkę i wykrywa za mały arkusz', async ({ page }) => {
  await page.goto('/');
  const out = page.locator('#fefco-out');
  await expect(out).toContainText('1430 × 500 mm');
  await page.locator('input[name="sheetL"]').fill('1000');
  await expect(out).toContainText('Arkusz za mały');
  await page.locator('input[name="L"]').fill('0');
  await expect(out).toContainText('L musi być liczbą dodatnią');
  await expect(out.locator('svg')).toHaveCount(0);
});

test('brak poziomego przewijania strony', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('menu mobilne otwiera nawigację', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'tylko widok telefonu');
  await page.goto('/');
  await page.getByRole('button', { name: 'Menu' }).click();
  await expect(page.locator('#nav')).toHaveClass(/nav--open/);
  await page.locator('#nav').getByRole('link', { name: 'Kod i schematy' }).click();
  await expect(page.locator('#nav')).not.toHaveClass(/nav--open/);
});
