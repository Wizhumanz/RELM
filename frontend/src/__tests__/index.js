
describe('localhost', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:3000');
  });

  it('should be titled "Listings Manager"', async () => {
    await expect(page.title()).resolves.toMatch('Listings Manager');
  });
});