import { test, expect } from "@playwright/test";

test("redirects root to default locale", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/es$/);
});

test("navigates through main sections in Spanish", async ({ page }) => {
  await page.goto("/es");
  await expect(page.getByRole("heading", { name: "Jhonier Santana" })).toBeVisible();

  await page.locator("header").getByRole("link", { name: "Proyectos", exact: true }).click();
  await expect(page).toHaveURL(/\/es\/proyectos$/);

  await expect(page.getByRole("status")).toContainText("En proceso");
});

test("switches locale to English", async ({ page }) => {
  await page.goto("/es");
  await page.getByRole("button", { name: "en" }).click();
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.getByRole("heading", { name: "Jhonier Santana" })).toBeVisible();
});

test("contact page renders form", async ({ page }) => {
  await page.goto("/es/contacto");
  await expect(page.getByLabel("Nombre")).toBeVisible();
  await expect(page.getByLabel("Correo")).toBeVisible();
  await expect(page.getByLabel("Mensaje")).toBeVisible();
});

test("mobile viewport shows hamburger menu and hides desktop nav", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/es");

  await expect(
    page.locator("header").getByRole("link", { name: "Proyectos", exact: true }),
  ).toBeHidden();

  const menuButton = page.getByRole("button", { name: "Abrir menú" });
  await expect(menuButton).toBeVisible();
  await menuButton.click();

  await page
    .locator("#mobile-nav-panel")
    .getByRole("link", { name: "Proyectos", exact: true })
    .click();
  await expect(page).toHaveURL(/\/es\/proyectos$/);
});
