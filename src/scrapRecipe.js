/* eslint-disable no-await-in-loop */
/* eslint-disable no-promise-executor-return */
const puppeteer = require('puppeteer');
const fs = require('fs');

const blogPath = './src/data/blog.json';
const recipePath = './src/data/recipe.json';

const saveData = (db, path) => {
  fs.writeFileSync(path, JSON.stringify(db));
};

const loadData = (path) => JSON.parse(fs.readFileSync(path));

const scrapYoutube = async (page, youtubeId) => {
  await page.goto(`https://www.youtube.com/watch?v=${youtubeId}`);
  await new Promise((r) => setTimeout(r, 3000));
  let moreBtn = await page.$('#more');
  const btnVis = await moreBtn
    .evaluate((el) => window.getComputedStyle(el).getPropertyValue('display') !== 'none' && el.offsetHeight);
  if (!btnVis) moreBtn = await page.$('#expand');
  await moreBtn.click();
  await new Promise((r) => setTimeout(r, 1000));
  const arr = await page.$$eval(
    'yt-formatted-string > a.yt-simple-endpoint',
    (els) => els.map((el) => el.href),
  );
  const redir = arr.find((str) => str.match('allrecipes.com'));
  await page.goto(redir, {
    waitUntil: 'networkidle2',
    timeout: 0,
  });
  await new Promise((r) => setTimeout(r, 3000));
  const recipeUrl = await page.url();
  console.log('recipe url', recipeUrl);
  await page.waitForSelector('.recipe-meta-item');
  const metas = await page.$$eval(
    '.recipe-meta-item',
    (els) => els.map((el) => el.textContent),
  );
  let cook;
  let prep;
  let total;
  let servings;
  metas.forEach((text) => {
    const nrr = text.replace(/[a-zA-Z]|\:/g, '').trim().split(' ');
    if (text.match('ervings')) {
      servings = parseInt(nrr[0]);
    } else if (text.match('ook:') || text.match('rep:') || text.match('otal:')) {
      console.log('parsing', text, nrr);
      let time = text.match('hr') ? parseInt(nrr[0]) * 60 : parseInt(nrr[0]);
      if (nrr.length > 1) time += parseInt(nrr[2]);
      if (text.match('ook:')) cook = time;
      else if (text.match('otal:')) total = time;
      else prep = time;
    }
  });
  await page.focus('a[aria-label="Read Full Nutrition"]');
  const fullLink = await page.$('a[aria-label="Read Full Nutrition"]');
  await fullLink.click();
  await page.waitForSelector('span.nutrient-name');
  const names = await page.$$eval('span.nutrient-name > .elementFont__details--bold', (els) => els.map((el) => el.textContent.trim()));
  const values = await page.$$eval('span.nutrient-value', (els) => els.map((el) => el.textContent));
  const nutrition = [];
  names.forEach((name, i) => {
    const vStr = values[i];
    const value = parseFloat(vStr.replace(/[a-zA-Z]/g, ''));
    const unit = vStr.replace(/\d|\./g, '').trim();
    nutrition.push({ name, value, unit });
  });
  return {
    recipeUrl,
    cook,
    prep,
    total,
    servings,
    nutrition,
  };
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

  const recipeDb = fs.existsSync(recipePath) ? loadData(recipePath) : [];
  console.log('existing recipes', recipeDb.length);

  const blogData = loadData(blogPath);
  for (let i = 0; i < blogData.length; i += 1) {
    const { youtubeId } = blogData[i];
    const dbMatched = recipeDb.find((dp) => dp.youtubeId === youtubeId);
    if (!dbMatched || !dbMatched.total) {
      const res = await scrapYoutube(page, youtubeId);
      if (dbMatched) {
        dbMatched.cook = res.cook;
        dbMatched.prep = res.prep;
      } else recipeDb.push({ ...res, youtubeId });
      saveData(recipeDb, recipePath);
    } else console.log('already scrapped', youtubeId);
  }

  await browser.close();
};

main();
