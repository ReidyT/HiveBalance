import {expect, test} from '@playwright/test';
import {generateEmail, generateUsername} from './utils/faker.utils';

test('user should create a new wallet successfully', async ({ page }) => {
  // ----- STEP 1: Create a new USer -----
  await page.goto('/');
  const email = generateEmail();
  const password = 'Password123$';

  // Because the user is not logged in, he is redirected to the login page.
  // User click on the signup link to create an account.
  const linkSign = page.getByRole("link", {name: "Sign Up"});
  await linkSign.click();

  // Fill the form with valid data and create the account.
  await page.getByRole("textbox", {name: "Email"}).fill(email);
  await page.getByRole("textbox", {name: "Username"}).fill(generateUsername());
  await page.locator("[data-testid = 'registration-password']").getByRole('textbox').fill(password);
  await page.locator("[data-testid = 'registration-confirm']").getByRole('textbox').fill(password);
  await page.getByRole("button", {name: /sign up/i}).click();

  // Ensure the server responded with a 201 Created.
  expect((await page.waitForResponse((response) =>
    response.url().includes('/auth/register')
  )).status()).toBe(201);

  // The user should be redirected to the home page.
  await expect(page.getByText("My Wallets")).toBeInViewport();
  expect((new URL(page.url()).pathname)).toBe('/');

  // ----- STEP 2: Open New Wallet Modal -----
  await page.getByRole('button', { name: /new wallet/i }).click();
  await expect(page.getByRole('dialog')).toBeVisible();

  // ----- STEP 3: Fill out wallet form -----
  const walletName = `Trip Wallet ${generateUsername()}`;

  await page.getByRole('textbox', { name: /name/i }).fill(walletName);
  await page.getByRole('combobox', { name: /currency/i }).click();
  await page.getByText('USD', { exact: false }).click();

  // ----- STEP 4: Submit the form -----
  await page.getByRole('button', { name: /create/i }).click();

  // ----- STEP 5: Verify wallet creation request -----
  const createResponse = await page.waitForResponse(resp =>
    resp.url().includes('/wallets') && resp.request().method() === 'POST'
  );
  expect(createResponse.status()).toBe(201);

  // ----- STEP 6: Wallet should appear in list -----
  await expect(page.getByText(walletName)).toBeVisible();
});
