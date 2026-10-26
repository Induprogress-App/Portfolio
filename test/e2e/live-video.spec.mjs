import { test, expect } from '@playwright/test';

// Test z prawdziwym YouTube: każda karta po przewinięciu do widoku odtwarza film producenta.
// Uruchamiany ręcznie (`npm run test:live`), bo zależy od sieci i dostępności YouTube.
test.skip(!process.env.LIVE_VIDEO, 'ustaw LIVE_VIDEO=1, aby sprawdzić filmy na żywo');
test.setTimeout(180_000);

test('każda karta odtwarza film producenta', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium');
  await page.goto('./');
  await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });
  const cards = page.locator('#projects [data-video]');
  await expect(cards).toHaveCount(7);
  const count = await cards.count();
  for (let i = 0; i < count; i++) {
    const media = cards.nth(i);
    await media.scrollIntoViewIfNeeded();
    await expect(media, `karta ${i + 1}: film nie ruszył`).toHaveAttribute('data-playing', 'true', { timeout: 25_000 });
    await expect(media).toHaveAttribute('data-preview', 'video', { timeout: 5_000 });
  }
});
