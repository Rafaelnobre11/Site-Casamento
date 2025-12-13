
import { test, expect } from '@playwright/test';

test.describe('Header Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the logo or names', async ({ page }) => {
    const logo = page.locator('header >> [data-testid="header-logo"]');
    const names = page.locator('header >> [data-testid="header-names"]');
    await expect(logo.or(names)).toBeVisible();
  });

  test('should show/hide background on scroll', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).not.toHaveClass(/bg-background/);
    await page.evaluate(() => window.scrollTo(0, 100));
    await expect(header).toHaveClass(/bg-background/);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(header).not.toHaveClass(/bg-background/);
  });

  test.describe('Desktop Navigation', () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test('should display navigation links', async ({ page }) => {
      const nav = page.locator('header >> nav');
      await expect(nav).toBeVisible();
      await expect(nav.locator('a')).toHaveCount(3);
    });

    test('should have a visible RSVP button', async ({ page }) => {
      const rsvpButton = page.locator('header >> text=Confirmar Presença');
      await expect(rsvpButton).toBeVisible();
    });
  });

  test.describe('Mobile Navigation', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should display hamburger menu', async ({ page }) => {
      const hamburger = page.locator('header >> [aria-label="Abrir menu"]');
      await expect(hamburger).toBeVisible();
    });

    test('should open and close mobile menu', async ({ page }) => {
      const hamburger = page.locator('header >> [aria-label="Abrir menu"]');
      const mobileMenu = page.locator('[data-testid="mobile-menu"]');
      const closeButton = page.locator('[aria-label="Fechar"]');

      await hamburger.click();
      await expect(mobileMenu).toBeVisible();

      await closeButton.click();
      await expect(mobileMenu).not.toBeVisible();
    });

    test('should have navigation links in mobile menu', async ({ page }) => {
      const hamburger = page.locator('header >> [aria-label="Abrir menu"]');
      await hamburger.click();
      
      const navLinks = page.locator('[data-testid="mobile-menu"] >> nav');
      await expect(navLinks.locator('a')).toHaveCount(3);
    });

    test('should have RSVP button in mobile menu', async ({ page }) => {
      const hamburger = page.locator('header >> [aria-label="Abrir menu"]');
      await hamburger.click();

      const rsvpButton = page.locator('[data-testid="mobile-menu"] >> text=Confirmar Presença');
      await expect(rsvpButton).toBeVisible();
    });
  });
});

