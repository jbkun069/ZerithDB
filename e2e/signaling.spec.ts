import { test, expect } from '@playwright/test';

test.describe('CRDT Synchronization Engine', () => {
  
  test('Should instantly sync state between peers in the playground', async ({ page }) => {
    // 1. Navigate to the application and enter the interactive playground
    await page.goto('http://localhost:3000/');
    await page.getByRole('link', { name: 'Try Playground' }).click();
    await expect(page).toHaveURL(/.*playground/);

    // Set up locators based on the playground UI
    // Since the inputs and buttons are identical, .first() targets Browser A (Alice)
    const aliceInput = page.getByPlaceholder('Type a message offline/online...').first();
    const aliceSaveBtn = page.getByRole('button', { name: 'Save' }).first();

    const uniqueTestMessage = `Automated Sync Test - ${Date.now()}`;

    // 2. Action: Inject data into Client A
    await aliceInput.fill(uniqueTestMessage);
    await aliceSaveBtn.click();

    // 3. Assertion: Verify CRDT sync
    // If the sync works, the unique message will render exactly twice on the page 
    // (Once in Alice's log, and once synced to Bob's log)
    await expect(page.getByText(uniqueTestMessage)).toHaveCount(2);
  });
  
});