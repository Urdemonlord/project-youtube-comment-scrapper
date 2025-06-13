import { test, expect } from '@playwright/test';
import path from 'path';

const html = path.resolve(__dirname, 'fixtures/comments.html');

test('shows sentiment badge after analysis', async ({ page }) => {
  await page.goto('file://' + html);
  await page.click('#analyze');
  const badge = page.locator('#comments li .badge');
  await expect(badge).toBeVisible();
  await expect(badge).toHaveAttribute('title', /Probability: 90%/);
});
