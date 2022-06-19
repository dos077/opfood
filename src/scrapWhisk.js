/* eslint-disable no-await-in-loop */
/* eslint-disable no-promise-executor-return */
const puppeteer = require('puppeteer');
const fs = require('fs');

const searchUrl = 'https://whisk.com/recipe-nutrition-calculator/';
const fwPath = './src/data/fwTube.json';
const hotThaiPath = './src/data/hotThai.json';
const preppyPath = './src/data/preppy.json';
const marionPath = './src/data/marion.json';
const whiskPath = './src/data/whisk.json';

const saveData = (db, path) => {
  fs.writeFileSync(path, JSON.stringify(db));
};

const loadData = (path) => JSON.parse(fs.readFileSync(path));

const scrap = async (page, recipeUrl) => {
  await page.goto(searchUrl);
  await new Promise((r) => setTimeout(r, 1000));
  await page.focus('#recipe_url');
  await page.keyboard.type(recipeUrl);
  await page.keyboard.press('Enter');
  await new Promise((r) => setTimeout(r, 5000));
  await page.waitForSelector('.s-n9m73l > .s-9xydgf');
  const moreBtn = await page.$('div.s-nhaiqc > a.s-uhv000');
  if (!moreBtn) return false;
  await moreBtn.click();
  await new Promise((r) => setTimeout(r, 20000));
  const cells = await page.$$eval('.s-n9m73l > .s-9xydgf', (els) => els.map((el) => el.textContent));
  const nutrition = [];
  for (let i = 0; i < cells.length; i += 3) {
    const name = cells[i].toLowerCase();
    const vStr = cells[i + 1];
    const value = parseFloat(vStr.replace(/[a-zA-Z]/g, ''));
    const unit = vStr.replace(/\d|\./g, '').trim();
    nutrition.push({ name, value, unit });
  }
  const infoDivs = await page.$$eval('.sc-jRQBWg', (els) => els.map((el) => el.textContent));
  const servings = parseInt(infoDivs[2].replace(/[a-zA-Z]|:/g, '').trim());
  return { nutrition, servings };
};

const main = async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium-browser',
    headless: false,
    args: ['--window-size=1300,1100'],
    defaultViewport: {
      width: 1280,
      height: 1080,
    },
  });
  const page = await browser.newPage();

  const recipes = loadData(fwPath);
  const hotThai = loadData(hotThaiPath);
  const preppy = loadData(preppyPath);
  const marion = loadData(marionPath);
  recipes.push(...hotThai);
  recipes.push(...preppy);
  recipes.push(...marion);
  const db = fs.existsSync(whiskPath) ? loadData(whiskPath) : [];

  for (let i = 0; i < recipes.length; i += 1) {
    const { recipeUrl, total, servings } = recipes[i];
    if (!db.some((dp) => dp.recipeUrl === recipeUrl) && total && servings) {
      const res = await scrap(page, recipeUrl);
      if (res) {
        db.push({ recipeUrl, ...res });
      } else {
        db.push({ recipeUrl, nutrition: false });
      }
      saveData(db, whiskPath);
    }
  }

  await browser.close();
};

main();
