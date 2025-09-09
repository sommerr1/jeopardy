import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { GamePage } from '../pages/GamePage';

test.describe('Language Jeopardy - Game Flow Tests (Refactored)', () => {
  let homePage: HomePage;
  let gamePage: GamePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    gamePage = new GamePage(page);
    await homePage.goto();
    await homePage.waitForLoad();
  });

  test('should start game and display game board', async () => {
    await homePage.waitForLoadingToComplete();
    await homePage.selectSheet();
    await homePage.page.waitForTimeout(1000);
    
    const playerName = 'Game Player';
    await homePage.createPlayer(playerName);
    
    await gamePage.expectGameStarted();
    await gamePage.expectGameBoardVisible();
  });

  test('should display score board with player information', async () => {
    await homePage.waitForLoadingToComplete();
    await homePage.selectSheet();
    await homePage.page.waitForTimeout(1000);
    
    const playerName = 'Score Player';
    await homePage.createPlayer(playerName);
    
    await gamePage.expectScoreBoardVisible();
    
    // Verify player name is displayed
    await expect(gamePage.page.locator(`text=${playerName}`).first()).toBeVisible();
  });

  test('should allow question selection and answering', async () => {
    await homePage.waitForLoadingToComplete();
    await homePage.selectSheet();
    await homePage.page.waitForTimeout(1000);
    
    const playerName = 'Question Player';
    await homePage.createPlayer(playerName);
    
    await gamePage.waitForGameBoard();
    
    const initialQuestions = await gamePage.getAvailableQuestionsCount();
    expect(initialQuestions).toBeGreaterThan(0);
    
    // Select and answer a question
    await gamePage.selectQuestion();
    await gamePage.answerQuestion();
    
    // Verify one question was answered
    const remainingQuestions = await gamePage.getAvailableQuestionsCount();
    expect(remainingQuestions).toBe(initialQuestions - 1);
  });

  test('should handle multiple questions in sequence', async () => {
    await homePage.waitForLoadingToComplete();
    await homePage.selectSheet();
    await homePage.page.waitForTimeout(1000);
    
    const playerName = 'Multi Player';
    await homePage.createPlayer(playerName);
    
    await gamePage.waitForGameBoard();
    
    const questionsAnswered = await gamePage.playGame(3);
    expect(questionsAnswered).toBeGreaterThan(0);
  });

  test('should track player score correctly', async () => {
    await homePage.waitForLoadingToComplete();
    await homePage.selectSheet();
    await homePage.page.waitForTimeout(1000);
    
    const playerName = 'Score Tracker';
    await homePage.createPlayer(playerName);
    
    await gamePage.waitForGameBoard();
    
    const initialScore = await gamePage.getPlayerScore();
    
    // Answer a few questions
    await gamePage.playGame(2);
    
    const finalScore = await gamePage.getPlayerScore();
    expect(finalScore).toBeGreaterThanOrEqual(initialScore);
  });

  test('should handle game over conditions', async () => {
    await homePage.waitForLoadingToComplete();
    await homePage.selectSheet();
    await homePage.page.waitForTimeout(1000);
    
    const playerName = 'Game Over Player';
    await homePage.createPlayer(playerName);
    
    await gamePage.waitForGameBoard();
    
    // Play until game ends
    await gamePage.playGame(50); // Large number to ensure game ends
    
    const gameEndState = await gamePage.waitForGameEnd();
    expect(['game_completed', 'game_over']).toContain(gameEndState);
  });

  test('should maintain game state on navigation', async ({ page }) => {
    await homePage.waitForLoadingToComplete();
    await homePage.selectSheet();
    await homePage.page.waitForTimeout(1000);
    
    const playerName = 'Navigation Player';
    await homePage.createPlayer(playerName);
    
    await gamePage.waitForGameBoard();
    
    // Answer a question
    await gamePage.selectQuestion();
    await gamePage.answerQuestion();
    
    const scoreAfterAnswer = await gamePage.getPlayerScore();
    
    // Navigate away and back
    await page.goto('about:blank');
    await homePage.goto();
    await homePage.waitForLoad();
    
    // Should return to game state
    await gamePage.expectGameStarted();
    await gamePage.expectGameBoardVisible();
    
    const scoreAfterNavigation = await gamePage.getPlayerScore();
    expect(scoreAfterNavigation).toBe(scoreAfterAnswer);
  });

  test('should handle different answer selections', async () => {
    await homePage.waitForLoadingToComplete();
    await homePage.selectSheet();
    await homePage.page.waitForTimeout(1000);
    
    const playerName = 'Answer Player';
    await homePage.createPlayer(playerName);
    
    await gamePage.waitForGameBoard();
    
    // Select a question
    await gamePage.selectQuestion();
    
    // Wait for question modal
    await gamePage.page.waitForSelector('h2, h3', { timeout: 5000 });
    
    // Get all answer options
    const answerButtons = gamePage.page.locator('.bg-white button:not([disabled]), .bg-gray-900 button:not([disabled])');
    const answerCount = await answerButtons.count();
    
    expect(answerCount).toBeGreaterThan(0);
    
    // Try different answer options
    for (let i = 0; i < Math.min(answerCount, 2); i++) {
      await gamePage.answerQuestion(i);
      await gamePage.page.waitForTimeout(1000);
      
      // Select another question for next iteration
      if (i < Math.min(answerCount, 2) - 1) {
        await gamePage.selectQuestion();
      }
    }
  });

  test('should handle rapid question answering', async () => {
    await homePage.waitForLoadingToComplete();
    await homePage.selectSheet();
    await homePage.page.waitForTimeout(1000);
    
    const playerName = 'Rapid Player';
    await homePage.createPlayer(playerName);
    
    await gamePage.waitForGameBoard();
    
    // Answer questions rapidly
    const questionsAnswered = await gamePage.playGame(5);
    expect(questionsAnswered).toBeGreaterThan(0);
  });
}); 