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

  // The user should be redirected to the home page.
  await expect(page.getByText("You are authenticated, some content will be added soon!")).toBeInViewport();
  expect((new URL(page.url()).pathname)).toBe('/');

  // Logout the user should redirect it to the login page.
  await page.getByRole("button", {name: "Log out"}).click();

  // Login the user by email.
  await page.getByRole("textbox", {name: "Username or Email"}).fill(email);
  await page.locator("[data-testid = 'login-password']").getByRole('textbox').fill(password);
  await page.getByRole("button", {name: "Log in"}).click();

  // The user should be redirected to the home page.
  await expect(page.getByText("You are authenticated, some content will be added soon!")).toBeInViewport();
  expect((new URL(page.url()).pathname)).toBe('/');

  // Logout the user should redirect to the login page.
  await page.getByRole("button", {name: "Log out"}).click();
  await expect(page.getByText("You are authenticated, some content will be added soon!")).not.toBeInViewport();
  expect((new URL(page.url()).pathname)).toBe('/login');
});
