import type { Page } from 'playwright/test';

export async function selectMantineOptionByLabel(
  page: Page,
  label: string,
  optionMatcher: string | RegExp
): Promise<void> {
  await page.getByRole('textbox', { name: label }).click();
  await page.getByRole('option', { name: optionMatcher }).click();
}

export async function selectMantineOptionByPlaceholder(
  page: Page,
  placeholder: string,
  optionMatcher: string | RegExp
): Promise<void> {
  await page.getByPlaceholder(placeholder).click();
  await page.getByRole('option', { name: optionMatcher }).click();
}
