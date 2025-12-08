import {expect, test} from '@playwright/test';
import {generateEmail, generateUsername, generateWalletName} from './utils/faker.utils';

test('user should create a new wallet, navigate to details, and edit it successfully', async ({ page }) => {
  // ===========================================================================
  // STEP 1: Registration (Setup)
  // ===========================================================================
  await page.goto('/');
  const email = generateEmail();
  const password = 'Password123$';

  // Navigate to Sign Up
  const linkSign = page.getByRole("link", {name: "Sign Up"});
  await linkSign.click();

  // Fill Registration Form
  await page.getByRole("textbox", {name: "Email"}).fill(email);
  await page.getByRole("textbox", {name: "Username"}).fill(generateUsername());
  await page.locator("[data-testid='registration-password']").getByRole('textbox').fill(password);
  await page.locator("[data-testid='registration-confirm']").getByRole('textbox').fill(password);

  // Submit and Wait for API
  const registerPromise = page.waitForResponse(response =>
    response.url().includes('/auth/register') && response.status() === 201
  );
  await page.getByRole("button", {name: /sign up/i}).click();
  await registerPromise;

  // Verify Redirect
  await expect(page.getByText("My Wallets")).toBeVisible();

  // ===========================================================================
  // STEP 2: Create Wallet
  // ===========================================================================
  await page.locator("[data-testid='button-new-wallet']").click();
  await expect(page.getByRole('dialog', { name: 'New Wallet' })).toBeVisible();

  const walletName = generateWalletName(20);

  // Fill Wallet Form
  await page.getByRole('textbox', { name: /name/i }).fill(walletName);

  // Select Currency
  await page.getByRole('combobox', { name: /currency/i }).click();
  await page.getByRole('option', { name: /USD/i }).click();

  // Submit Creation
  const createPromise = page.waitForResponse(resp =>
    resp.url().includes('/wallets') && resp.request().method() === 'POST'
  );
  await page.getByRole('button', { name: /create/i }).click();
  const createResponse = await createPromise;
  expect(createResponse.status()).toBe(201);

  // Verify it appears in the list
  const walletCard = page.getByText(walletName);
  await expect(walletCard).toBeVisible();

  // ===========================================================================
  // STEP 3: Navigate to Wallet Details
  // ===========================================================================
  await walletCard.click();

  // Verify we are on the details page (URL check or Header check)
  await expect(page).toHaveURL(/\/wallets\//);
  // Based on the menu component, the header contains the wallet name
  await expect(page.getByRole('heading', { level: 1 }).or(page.getByText(walletName)).first()).toBeVisible();

  // ===========================================================================
  // STEP 4: Open Edit Modal
  // ===========================================================================
  // Find the "Settings" item in the menu.
  await page.locator("[data-testid = 'wallet-edit-settings']").click();

  // Check that the Edit Dialog opened and pre-filled data is correct
  const editDialog = page.getByRole('dialog', { name: 'Edit Wallet' });
  await expect(editDialog).toBeVisible();

  // Verify the input contains the old name
  const nameInput = editDialog.getByRole('textbox', { name: /name/i });
  await expect(nameInput).toHaveValue(walletName);

  // ===========================================================================
  // STEP 5: Edit Wallet
  // ===========================================================================
  const updatedWalletName = `${walletName} - Updated`;
  await nameInput.fill(updatedWalletName);

  // ===========================================================================
  // STEP 6: Save and Verify
  // ===========================================================================
  // Setup wait for PATCH request
  const updatePromise = page.waitForResponse(resp =>
    resp.url().includes('/wallets') &&
    (resp.request().method() === 'PUT' || resp.request().method() === 'PATCH')
  );

  // Click Save
  await editDialog.getByRole('button', { name: /save changes/i }).click();

  const updateResponse = await updatePromise;
  expect(updateResponse.status()).toBe(200); // or 204

  // Verify Dialog closed
  await expect(editDialog).toBeHidden();

  // Verify the new name is visible on the page
  await expect(page.getByText(updatedWalletName)).toBeVisible();
});
