import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route(/youtube(-nocookie)?\.com|ytimg\.com/, route => route.abort());
  await page.goto('./');
});

test('HMI: interlock, cykl pracy, usterka czujnika i kwitowanie', async ({ page }) => {
  const hmi = page.locator('#hmi-demo');
  await hmi.scrollIntoViewIfNeeded();
  const start = hmi.locator('#hmi-start');
  const state = hmi.locator('#hmi-state');

  // Zimny produkt: START zablokowany, komunikat interlocku.
  await expect(hmi.locator('#hmi-alarms')).toContainText('Interlock');
  await expect(state).toHaveText('GOTOWA', { timeout: 15_000 });
  await expect(start).toBeEnabled();

  await start.click();
  await expect(state).toHaveText('PRACA');
  await expect(hmi.locator('#hmi-count')).toHaveText(/^[1-9]\d* \/ 50$/, { timeout: 10_000 });

  await page.locator('#hmi-fault').selectOption('4');
  await expect(state).toHaveText('ALARM', { timeout: 10_000 });
  await expect(hmi.locator('#hmi-alarms')).toContainText('ErrorID.X04');
  await expect(start).toBeDisabled();

  await hmi.locator('#hmi-ack').click();
  await expect(state).toHaveText('GOTOWA');
  await expect(start).toBeEnabled();
});

test('HMI: tryb ręczny blokuje START i odblokowuje grzałkę', async ({ page }) => {
  const hmi = page.locator('#hmi-demo');
  await hmi.scrollIntoViewIfNeeded();
  await expect(hmi.locator('#hmi-heater')).toBeDisabled();
  await hmi.locator('#hmi-mode').click();
  await expect(hmi.locator('#hmi-mode-label')).toHaveText('RĘCZNY');
  await expect(hmi.locator('#hmi-start')).toBeDisabled();
  await hmi.locator('#hmi-heater').click();
  await expect(hmi.locator('#hmi-heater')).toHaveAttribute('aria-pressed', 'false');
});

test('SCADA: sygnały, kursor czasu, porównanie partii', async ({ page }) => {
  const scada = page.locator('#scada-demo');
  await scada.scrollIntoViewIfNeeded();
  await expect(scada.locator('polyline:not(.is-compare)')).toHaveCount(4);
  await scada.getByLabel(/Temperatura łożyska/).check();
  await expect(scada.locator('polyline:not(.is-compare)')).toHaveCount(5);

  const svg = scada.locator('#scada-svg');
  await svg.focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(scada.locator('#scada-readout')).toContainText('01:00');
  await expect(scada.locator('#scada-readout')).toContainText('Załadunek');

  await scada.locator('#scada-compare').selectOption('P-102');
  await expect(scada.locator('polyline.is-compare')).toHaveCount(5);
});

test('SCADA: alarmy, raport i eksport CSV', async ({ page }) => {
  const scada = page.locator('#scada-demo');
  await scada.scrollIntoViewIfNeeded();
  await scada.locator('#scada-batch').selectOption('P-103');
  await expect(scada.locator('#scada-alarm-count')).toHaveText('(1)');
  await scada.getByRole('button', { name: /Alarmy/ }).click();
  await expect(scada.locator('.scada__table')).toContainText('Temperatura łożyska > 75 °C');
  await scada.getByRole('button', { name: 'Raport partii' }).click();
  await expect(scada.locator('.scada__table caption')).toHaveText('Raport partii P-103');

  const download = page.waitForEvent('download');
  await scada.getByRole('button', { name: 'Eksport CSV' }).click();
  const file = await download;
  expect(file.suggestedFilename()).toBe('partia-P-103.csv');
});
