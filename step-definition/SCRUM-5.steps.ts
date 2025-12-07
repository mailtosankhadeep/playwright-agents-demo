import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import { chromium, Browser, BrowserContext, Page, expect } from '@playwright/test';

interface WorldState {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
}

const state: WorldState = {};

Before(async function () {
  const headed = process.env.HEADED === '1' || process.env.HEADED === 'true';
  state.browser = await chromium.launch({ headless: !headed });
  state.context = await state.browser.newContext();
  state.page = await state.context.newPage();
});

After(async function () {
  await state.page?.close().catch(() => {});
  await state.context?.close().catch(() => {});
  await state.browser?.close().catch(() => {});
});

Given('I open {string}', async function (url: string) {
  if (!state.page) throw new Error('Playwright page not initialized');
  await state.page.goto(url);
});

When('I click the {string} feature on the landing page', async function (featureName: string) {
  if (!state.page) throw new Error('Playwright page not initialized');
  await state.page.getByRole('link', { name: new RegExp(featureName, 'i') }).click();
});

Then('I should be on the {string} page', async function (pageName: string) {
  if (!state.page) throw new Error('Playwright page not initialized');
  // Verify by URL containing a slug derived from the page name when possible,
  // and also by heading presence for robustness.
  const slug = pageName.trim().toLowerCase().replace(/\s+/g, '-');
  await expect(state.page).toHaveURL(new RegExp(slug, 'i'));
  await expect(state.page.getByRole('heading', { name: new RegExp(pageName, 'i') })).toBeVisible({ timeout: 5000 });
});

Then('I should see a {string} field', async function (labelText: string) {
  if (!state.page) throw new Error('Playwright page not initialized');
  const name = labelText.trim();
  const byExactLabel = state.page.getByLabel(new RegExp(`^${name}$`, 'i')).first();
  const byLooseLabel = state.page.getByLabel(new RegExp(name, 'i')).first();
  const byPlaceholder = state.page.getByPlaceholder(new RegExp(name, 'i')).first();
  const byRoleTextbox = state.page.getByRole('textbox', { name: new RegExp(name, 'i') }).first();

  const candidates = [byExactLabel, byLooseLabel, byPlaceholder, byRoleTextbox];
  for (const c of candidates) {
    if (await c.isVisible().catch(() => false)) {
      await expect(c).toBeVisible();
      return;
    }
  }

  if (/^password$/i.test(name)) {
    const byType = state.page.locator('input[type="password"]').first();
    await expect(byType).toBeVisible();
    return;
  }

  throw new Error(`Field not found by label/placeholder/role: ${name}`);
});
