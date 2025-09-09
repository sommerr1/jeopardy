import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { GamePage } from '../pages/GamePage';

test.describe('Language Jeopardy - Renderer Tests', () => {
  let homePage: HomePage;
  let gamePage: GamePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    gamePage = new GamePage(page);
    await homePage.goto();
    await homePage.waitForLoad();
  });

  test('should switch between different renderers', async () => {
    await homePage.waitForLoadingToComplete();
    await homePage.selectSheet();
    await homePage.page.waitForTimeout(1000);
    
    const playerName = 'Renderer Player';
    await homePage.createPlayer(playerName);
    
    await gamePage.waitForGameBoard();
    
    // Test switching to different renderers
    const renderers = ['classic', 'minimal', 'dark'];
    
    for (const renderer of renderers) {
      await gamePage.switchRenderer(renderer);
      await gamePage.page.waitForTimeout(1000);
      
      await gamePage.expectRendererApplied(renderer);
      
      // Verify game board is still functional
      await gamePage.expectGameBoardVisible();
    }
  });

  test('should maintain game state when switching renderers', async () => {
    await homePage.waitForLoadingToComplete();
    await homePage.selectSheet();
    await homePage.page.waitForTimeout(1000);
    
    const playerName = 'State Player';
    await homePage.createPlayer(playerName);
    
    await gamePage.waitForGameBoard();
    
    // Answer a question in classic renderer
    await gamePage.switchRenderer('classic');
    await gamePage.page.waitForTimeout(1000);
    
    const initialQuestions = await gamePage.getAvailableQuestionsCount();
    await gamePage.selectQuestion();
    await gamePage.answerQuestion();
    
    const questionsAfterAnswer = await gamePage.getAvailableQuestionsCount();
    expect(questionsAfterAnswer).toBe(initialQuestions - 1);
    
    // Switch to dark renderer
    await gamePage.switchRenderer('dark');
    await gamePage.page.waitForTimeout(1000);
    
    // Verify the same question is still answered
    const questionsAfterSwitch = await gamePage.getAvailableQuestionsCount();
    expect(questionsAfterSwitch).toBe(questionsAfterAnswer);
  });

  test('should apply correct styling for each renderer', async () => {
    await homePage.waitForLoadingToComplete();
    await homePage.selectSheet();
    await homePage.page.waitForTimeout(1000);
    
    const playerName = 'Styling Player';
    await homePage.createPlayer(playerName);
    
    await gamePage.waitForGameBoard();
    
    // Test classic renderer styling
    await gamePage.switchRenderer('classic');
    await gamePage.page.waitForTimeout(1000);
    await expect(gamePage.page.locator('.bg-blue-100').first()).toBeVisible();
    
    // Test minimal renderer styling
    await gamePage.switchRenderer('minimal');
    await gamePage.page.waitForTimeout(1000);
    await expect(gamePage.page.locator('.bg-white').first()).toBeVisible();
    
    // Test dark renderer styling
    await gamePage.switchRenderer('dark');
    await gamePage.page.waitForTimeout(1000);
    await expect(gamePage.page.locator('.bg-gray-900').first()).toBeVisible();
  });

  test('should handle question modals in different renderers', async () => {
    await homePage.waitForLoadingToComplete();
    await homePage.selectSheet();
    await homePage.page.waitForTimeout(1000);
    
    const playerName = 'Modal Player';
    await homePage.createPlayer(playerName);
    
    await gamePage.waitForGameBoard();
    
    const renderers = ['classic', 'minimal', 'dark'];
    
    for (const renderer of renderers) {
      await gamePage.switchRenderer(renderer);
      await gamePage.page.waitForTimeout(1000);
      
      // Select a question
      await gamePage.selectQuestion();
      
      // Verify modal appears with correct styling
      await expect(gamePage.questionModal).toBeVisible();
      
      // Answer the question
      await gamePage.answerQuestion();
      
      // Verify modal closes
      await expect(gamePage.questionModal).not.toBeVisible();
    }
  });

  test('should display score board correctly in all renderers', async () => {
    await homePage.waitForLoadingToComplete();
    await homePage.selectSheet();
    await homePage.page.waitForTimeout(1000);
    
    const playerName = 'Score Board Player';
    await homePage.createPlayer(playerName);
    
    await gamePage.waitForGameBoard();
    
    const renderers = ['classic', 'minimal', 'dark'];
    
    for (const renderer of renderers) {
      await gamePage.switchRenderer(renderer);
      await gamePage.page.waitForTimeout(1000);
      
      // Verify score board is visible
      await gamePage.expectScoreBoardVisible();
      
      // Verify player name is displayed
      await expect(gamePage.page.locator(`text=${playerName}`).first()).toBeVisible();
    }
  });

  test('should handle renderer persistence on page refresh', async ({ page }) => {
    await homePage.waitForLoadingToComplete();
    await homePage.selectSheet();
    await homePage.page.waitForTimeout(1000);
    
    const playerName = 'Persistence Player';
    await homePage.createPlayer(playerName);
    
    await gamePage.waitForGameBoard();
    
    // Switch to dark renderer
    await gamePage.switchRenderer('dark');
    await gamePage.page.waitForTimeout(1000);
    
    // Refresh page
    await page.reload();
    await homePage.waitForLoad();
    
    // Should return to game with dark renderer
    await gamePage.expectGameStarted();
    await gamePage.expectRendererApplied('dark');
  });

  test('should handle rapid renderer switching', async () => {
    await homePage.waitForLoadingToComplete();
    await homePage.selectSheet();
    await homePage.page.waitForTimeout(1000);
    
    const playerName = 'Rapid Switch Player';
    await homePage.createPlayer(playerName);
    
    await gamePage.waitForGameBoard();
    
    // Rapidly switch between renderers
    const renderers = ['classic', 'minimal', 'dark', 'classic', 'dark', 'minimal'];
    
    for (const renderer of renderers) {
      await gamePage.switchRenderer(renderer);
      await gamePage.page.waitForTimeout(500);
      
      await gamePage.expectRendererApplied(renderer);
      await gamePage.expectGameBoardVisible();
    }
  });

  test('should maintain question state across renderer switches', async () => {
    await homePage.waitForLoadingToComplete();
    await homePage.selectSheet();
    await homePage.page.waitForTimeout(1000);
    
    const playerName = 'Question State Player';
    await homePage.createPlayer(playerName);
    
    await gamePage.waitForGameBoard();
    
    // Answer a question in classic renderer
    await gamePage.switchRenderer('classic');
    await gamePage.page.waitForTimeout(1000);
    
    await gamePage.selectQuestion();
    await gamePage.answerQuestion();
    
    const scoreAfterAnswer = await gamePage.getPlayerScore();
    
    // Switch to minimal renderer
    await gamePage.switchRenderer('minimal');
    await gamePage.page.waitForTimeout(1000);
    
    // Verify score is maintained
    const scoreAfterSwitch = await gamePage.getPlayerScore();
    expect(scoreAfterSwitch).toBe(scoreAfterAnswer);
    
    // Answer another question in minimal renderer
    await gamePage.selectQuestion();
    await gamePage.answerQuestion();
    
    const scoreAfterSecondAnswer = await gamePage.getPlayerScore();
    expect(scoreAfterSecondAnswer).toBeGreaterThan(scoreAfterSwitch);
  });
}); 