import {expect, test} from '@playwright/test';
import {generateEmail, generateUsername} from './utils/faker.utils';

test('guest user should register or log in to access protected home', async ({page}) => {
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

  // Logout the user should redirect it to the login page.
  await page.locator("[data-testid = 'button-logout']").click();

  // Ensure the server responded with a 201 Created.
  expect((await page.waitForResponse((response) =>
    response.url().includes('/auth/logout')
  )).status()).toBe(200);

  // Login the user by email.
  await page.getByRole("textbox", {name: "Username or Email"}).fill(email);
  await page.locator("[data-testid = 'login-password']").getByRole('textbox').fill(password);
  await page.getByRole("button", {name: "Log in"}).click();

  // Ensure the server responded with a 201 Created.
  expect((await page.waitForResponse((response) =>
    response.url().includes('/auth/login')
  )).status()).toBe(201);

  // The user should be redirected to the home page.
  await expect(page.getByText("My Wallets")).toBeInViewport();
  expect((new URL(page.url()).pathname)).toBe('/');

  // Logout the user should redirect to the login page.
  await page.locator("[data-testid = 'button-logout']").click();
  // Ensure the server responded with a 201 Created.
  expect((await page.waitForResponse((response) =>
    response.url().includes('/auth/logout')
  )).status()).toBe(200);
  await expect(page.getByText("My Wallets")).not.toBeInViewport();
  expect((new URL(page.url()).pathname)).toBe('/auth/login');
});
