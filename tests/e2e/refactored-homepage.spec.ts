import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Language Jeopardy - Homepage Tests (Refactored)', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.waitForLoad();
  });

  test('should load homepage successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Jeopardy/);
    await homePage.expectWelcomeScreen();
  });

  test('should display all welcome screen elements', async () => {
    await homePage.expectFormElements();
    await homePage.expectProperLayout();
  });

  test('should show loading state and then complete', async () => {
    await expect(homePage.loadingIndicator).toBeVisible();
    await homePage.waitForLoadingToComplete();
    await expect(homePage.loadingIndicator).not.toBeVisible();
  });

  test('should have sheet selection dropdown with options', async () => {
    await homePage.waitForLoadingToComplete();
    
    const options = homePage.getSheetOptions();
    const optionsCount = await options.count();
    
    expect(optionsCount).toBeGreaterThan(1);
    
    const defaultOption = homePage.sheetSelect.locator('option[value=""]').first();
    await expect(defaultOption).toHaveText('Выберите лист');
  });

  test('should handle form state transitions', async () => {
    await homePage.waitForLoadingToComplete();
    
    // Initial state - form should be disabled
    await homePage.expectInitialState();
    
    // Select a sheet to enable form
    await homePage.selectSheet();
    await homePage.page.waitForTimeout(1000);
    
    // Form should now be active
    await homePage.expectActiveState();
    await expect(homePage.sheetSelect).not.toHaveValue('');
  });

  test('should allow player creation', async () => {
    await homePage.waitForLoadingToComplete();
    await homePage.selectSheet();
    await homePage.page.waitForTimeout(1000);
    
    const playerName = 'Test Player';
    await homePage.playerNameInput.fill(playerName);
    await expect(homePage.playerNameInput).toHaveValue(playerName);
    
    await homePage.createPlayer(playerName);
    
    // Should transition to game screen
    await homePage.expectGameStarted();
  });

  test('should validate form inputs', async () => {
    await homePage.waitForLoadingToComplete();
    await homePage.selectSheet();
    await homePage.page.waitForTimeout(1000);
    
    // Test empty player name
    await homePage.playerNameInput.fill('');
    await expect(homePage.startGameButton).toBeDisabled();
    
    // Test valid player name
    await homePage.playerNameInput.fill('Valid Player');
    await expect(homePage.startGameButton).toBeEnabled();
  });

  test('should maintain state on page refresh', async ({ page }) => {
    await homePage.waitForLoadingToComplete();
    await homePage.selectSheet();
    await homePage.page.waitForTimeout(1000);
    
    const playerName = 'Persistent Player';
    await homePage.playerNameInput.fill(playerName);
    
    // Refresh page
    await page.reload();
    await homePage.waitForLoad();
    await homePage.waitForLoadingToComplete();
    
    // State should be maintained
    await expect(homePage.sheetSelect).not.toHaveValue('');
    await expect(homePage.playerNameInput).toHaveValue(playerName);
  });

  test('should handle multiple sheet selections', async () => {
    await homePage.waitForLoadingToComplete();
    
    const options = homePage.getSheetOptions();
    const optionsCount = await options.count();
    
    // Test selecting different sheets
    for (let i = 1; i < Math.min(optionsCount, 4); i++) {
      await homePage.sheetSelect.selectOption({ index: i });
      await homePage.page.waitForTimeout(500);
      
      const selectedValue = await homePage.getSelectedSheetValue();
      expect(selectedValue).not.toBe('');
    }
  });

  test('should have responsive design elements', async () => {
    await homePage.waitForLoadingToComplete();
    
    // Test on different viewport sizes
    await homePage.page.setViewportSize({ width: 375, height: 667 }); // Mobile
    await homePage.expectProperLayout();
    
    await homePage.page.setViewportSize({ width: 1024, height: 768 }); // Tablet
    await homePage.expectProperLayout();
    
    await homePage.page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
    await homePage.expectProperLayout();
  });
}); 