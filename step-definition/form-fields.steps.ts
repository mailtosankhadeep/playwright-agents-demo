import { Given, When, Then, Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { expect } from '@playwright/test';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

setDefaultTimeout(60_000);

interface WorldContext {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  tracePath?: string;
}

declare module '@cucumber/cucumber' {
  // Extend the World type if needed (runtime world is 'this')
  interface World extends WorldContext {}
}

Before(async function (this: WorldContext) {
  const headed = (process.env.HEADED || '').toLowerCase() === '1' || (process.env.HEADED || '').toLowerCase() === 'true';
  this.browser = await chromium.launch({ headless: !headed, slowMo: headed ? 50 : 0 });
  this.context = await this.browser.newContext();
  const traceDir = process.env.TRACE_DIR ?? 'test-results';
  if (!existsSync(traceDir)) {
    mkdirSync(traceDir, { recursive: true });
  }
  this.tracePath = join(traceDir, `trace-${Date.now()}.zip`);
  await this.context.tracing.start({ screenshots: true, snapshots: true });
  this.page = await this.context.newPage();
});

After(async function (this: WorldContext) {
  if (this.context && this.tracePath) {
    await this.context.tracing.stop({ path: this.tracePath });
  }
  await this.page?.close();
  await this.context?.close();
  await this.browser?.close();
});

Given('I am on the practice-automation homepage', async function (this: WorldContext) {
  await this.page!.goto('https://practice-automation.com/');
});

When('I click the Form Fields feature', async function (this: WorldContext) {
  const formFieldsLink = this.page!.getByRole('link', { name: 'Form Fields' });
  await expect(formFieldsLink).toBeVisible();
  await formFieldsLink.scrollIntoViewIfNeeded();
  await formFieldsLink.click();
});

Then('I should navigate to the Form Fields page', async function (this: WorldContext) {
  await expect(this.page!).toHaveURL(/\/form-fields\/?$/);
  await expect(this.page!.getByRole('heading', { name: /Form\s+Fields/ })).toBeVisible();
});
