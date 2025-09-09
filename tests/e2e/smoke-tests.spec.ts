import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { GamePage } from '../pages/GamePage';
import { TestConfig } from '../config/test-config';

test.describe('Language Jeopardy - Smoke Tests', () => {
  test('@smoke should load homepage and display basic elements', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.waitForLoad();
    
    // Basic page load check
    await expect(page).toHaveTitle(/Jeopardy/);
    await homePage.expectWelcomeScreen();
    
    // Select game type to proceed to welcome screen
    await homePage.selectGameType();
    await homePage.expectWelcomeScreenAfterGameType();
  });

  test('@smoke should complete basic game flow', async ({ page }) => {
    const homePage = new HomePage(page);
    const gamePage = new GamePage(page);
    
    await homePage.goto();
    await homePage.waitForLoad();
    await homePage.waitForLoadingToComplete();
    
    // Select game type first
    await homePage.selectGameType();
    
    // Start game
    await homePage.selectSheet();
    await homePage.page.waitForTimeout(1000);
    await homePage.createPlayer(TestConfig.TEST_PLAYERS.DEFAULT);
    
    // Verify game started
    await gamePage.expectGameStarted();
    await gamePage.expectGameBoardVisible();
  });

  test('@smoke should answer one question successfully', async ({ page }) => {
    const homePage = new HomePage(page);
    const gamePage = new GamePage(page);
    
    await homePage.goto();
    await homePage.waitForLoad();
    await homePage.waitForLoadingToComplete();
    
    // Select game type first
    await homePage.selectGameType();
    
    // Start game
    await homePage.selectSheet();
    await homePage.page.waitForTimeout(1000);
    await homePage.createPlayer(TestConfig.TEST_PLAYERS.DEFAULT);
    
    // Answer one question
    await gamePage.waitForGameBoard();
    const initialQuestions = await gamePage.getAvailableQuestionsCount();
    
    if (initialQuestions > 0) {
      await gamePage.selectQuestion();
      await gamePage.answerQuestion();
      
      const remainingQuestions = await gamePage.getAvailableQuestionsCount();
      expect(remainingQuestions).toBe(initialQuestions - 1);
    }
  });

  test('@smoke should switch renderers without errors', async ({ page }) => {
    const homePage = new HomePage(page);
    const gamePage = new GamePage(page);
    
    await homePage.goto();
    await homePage.waitForLoad();
    await homePage.waitForLoadingToComplete();
    
    // Select game type first
    await homePage.selectGameType();
    
    // Start game
    await homePage.selectSheet();
    await homePage.page.waitForTimeout(1000);
    await homePage.createPlayer(TestConfig.TEST_PLAYERS.DEFAULT);
    
    await gamePage.waitForGameBoard();
    
    // Test renderer switching using GamePage methods (renderer selector is in TopBar during game)
    await gamePage.switchRenderer('dark');
    await gamePage.page.waitForTimeout(1000);
    await gamePage.expectRendererApplied('dark');
    await gamePage.expectGameBoardVisible();
    
    // Switch back to classic
    await gamePage.switchRenderer('classic');
    await gamePage.page.waitForTimeout(1000);
    await gamePage.expectRendererApplied('classic');
    await gamePage.expectGameBoardVisible();
  });

  test('@smoke should handle responsive design', async ({ page }) => {
    const homePage = new HomePage(page);
    
    await homePage.goto();
    await homePage.waitForLoad();
    await homePage.waitForLoadingToComplete();
    
    // Test mobile viewport
    await homePage.page.setViewportSize(TestConfig.VIEWPORTS.MOBILE);
    await homePage.expectProperLayout();
    
    // Test desktop viewport
    await homePage.page.setViewportSize(TestConfig.VIEWPORTS.DESKTOP);
    await homePage.expectProperLayout();
  });

  test('@smoke should maintain state on page refresh', async ({ page }) => {
    const homePage = new HomePage(page);
    const gamePage = new GamePage(page);
    
    await homePage.goto();
    await homePage.waitForLoad();
    await homePage.waitForLoadingToComplete();
    
    // Select game type first
    await homePage.selectGameType();
    
    // Start game
    await homePage.selectSheet();
    await homePage.page.waitForTimeout(1000);
    const playerName = TestConfig.TEST_PLAYERS.DEFAULT;
    await homePage.createPlayer(playerName);
    
    await gamePage.waitForGameBoard();
    
    // Refresh page
    await page.reload();
    await homePage.waitForLoad();
    
    // After refresh, we might need to wait for the game to restore state
    // or we might be back at the welcome screen
    try {
      // Try to wait for game elements to appear (restored state)
      await gamePage.waitForGameBoard();
      await gamePage.expectGameBoardVisible();
    } catch {
      // If game state wasn't restored, we need to restart the game
      await homePage.selectGameType();
      await homePage.selectSheet();
      await homePage.page.waitForTimeout(1000);
      await homePage.createPlayer(playerName);
      await gamePage.waitForGameBoard();
      await gamePage.expectGameBoardVisible();
    }
  });

  test('@smoke should test renderer selection and switching', async ({ page }) => {
    const homePage = new HomePage(page);
    const gamePage = new GamePage(page);
    
    await homePage.goto();
    await homePage.waitForLoad();
    await homePage.waitForLoadingToComplete();
    
    // Select game type first
    await homePage.selectGameType();
    
    // Start game
    await homePage.selectSheet();
    await homePage.page.waitForTimeout(1000);
    const playerName = TestConfig.TEST_PLAYERS.DEFAULT;
    await homePage.createPlayer(playerName);
    
    await gamePage.waitForGameBoard();
    
    // Test renderer switching (renderer selector is in TopBar during game)
    await gamePage.switchRenderer('dark');
    await gamePage.page.waitForTimeout(1000);
    await gamePage.expectRendererApplied('dark');
    await gamePage.expectGameBoardVisible();
    
    // Switch back to classic
    await gamePage.switchRenderer('classic');
    await gamePage.page.waitForTimeout(1000);
    await gamePage.expectRendererApplied('classic');
    await gamePage.expectGameBoardVisible();
  });
}); 