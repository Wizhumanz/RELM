
describe('localhost', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:3000');
  });

  it('should be titled "Listings Manager"', async () => {
    await expect(page.title()).resolves.toMatch('Listings Manager');
  });
  it('should log in', async () => {
    await page.click("#email");
    await page.type("#email", 'agent@agent.com');
    await page.click("#password");
    await page.type("#password", 'agent');
    await page.click("[type='submit']");
    await expect(page.url()).toMatch('http://localhost:3000/listings/all')
  });
  it('checking All Listings page', async () => {
    await page.goto('http://localhost:3000/listings/all');
    await expect(page).toMatch('All Listings')
    await page.click("#flexCheckDefault");
    await page.click("#flexCheckChecked");
  })
  it('checking Pending Listings page', async () => {
    await page.goto('http://localhost:3000/listings/pending');
    await expect(page).toMatch('Pending Listings')
    await page.click("#flexCheckDefault");
    await page.click("#flexCheckPending");
  })
  it('checking Add Listings page', async () => {
    await page.goto('http://localhost:3000/add');
    await expect(page).toMatch('Add Listing')
    await expect(page).toMatch('Manual Add')
    await page.click("#excel-upload");
    await page.click("#name");
    await page.type("#name", 'Diamond Villa');
    await page.click("#address");
    await page.type("#address", 'ABC');
    await page.click("#listingType");
    await page.select("[id='listingType']", 'Buy');
    await page.click("#price");
    await page.type("#price", '1000');
    await page.click(".form");
    await page.click("[type='submit']");
  })
});










/*

await page.click(".navbar-nav > li:nth-of-type(1) .nav-link");
    await page.click(".navbar-nav > li:nth-of-type(2) .nav-link");
    await page.click(".navbar-nav > li:nth-of-type(3) .nav-link");
const puppeteer = require('puppeteer');

let browser;
beforeAll(async () => {
  browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.goto("http://localhost:3000");
})

afterAll(async () => {
  await browser.close();
})

test('should log in', async () => {
  await page.click("#email");
  await page.type("#email", 'agent@agent.com');
  await page.click("#password");
  await page.type("#password", 'agent');
  await page.click("[type='submit']");
  await page.goto('http://localhost:3000/listings/all');
  
})

*/