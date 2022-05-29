/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-promise-executor-return */
const puppeteer = require('puppeteer');
const fs = require('fs');

const preppyPath = './src/data/preppy.json';
const preppyUrl = 'https://preppykitchen.com/recipes/';

const loadData = (path) => JSON.parse(fs.readFileSync(path));

const saveData = (db, path) => {
  fs.writeFileSync(path, JSON.stringify(db));
};

const scrapRecipe = async (page) => {
  const titleEl = await page.$('h2.wprm-recipe-name');
  if (!titleEl) return false;
  const title = await page.$eval('h2.wprm-recipe-name', (el) => el.textContent);
  const tnImg = await page.$('div.rll-youtube-player > div > img');
  if (!tnImg) return false;
  const embedUrl = await page.$eval('div.rll-youtube-player', (el) => el.getAttribute('data-src'));
  const youtubeId = embedUrl.split('/embed/')[1];
  const videoUrl = `https://youtube.com/watch?v=${youtubeId}`;
  const thumbnail = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  let cook;
  let prep;
  let servings;
  const labels = [];
  const details = await page.$$eval('.wprm-recipe-block-container', (els) => els.map((el) => el.textContent.trim()));
  details.forEach((text) => {
    const nrr = text.replace(/[a-zA-Z]|:/g, '').trim().split(' ').filter((str) => str !== '');
    if (text.match('Servings')) {
      servings = parseInt(nrr[0]);
    } else if (text.match('Cook') || text.match('Prep')) {
      console.log('parsing', text, nrr);
      let time = text.match('hour') ? parseInt(nrr[0]) * 60 : parseInt(nrr[0]);
      if (nrr.length > 1) time += parseInt(nrr[1]);
      if (text.match('Cook')) cook = time;
      else prep = time;
    } else if (text.match('Course') || text.match('Cuisine')) {
      const srr = text.split(' ');
      const str = srr.slice(1).join(' ');
      if (str.match(', ')) {
        labels.push(...str.split(', '));
      } else {
        labels.push(str);
      }
    }
  });
  return {
    title,
    thumbnail,
    videoUrl,
    cook,
    prep,
    total: cook + prep,
    labels,
    servings,
  };
};

const scrapCategory = async (page, db) => {
  let entryLinks = await page.$$eval('a.entry-image-link', (els) => els.map((el) => el.href));
  for (let p = 0; p < 10; p += 1) {
    const nextBtn = await page.$('li.pagination-next > a');
    const nextPage = nextBtn ? await nextBtn.evaluate((el) => el.href) : null;
    for (let i = 0; i < entryLinks.length; i += 1) {
      const recipeUrl = entryLinks[i];
      console.log('scraping recipe', recipeUrl);
      if (db.some((dp) => dp.recipeUrl === recipeUrl)) continue;
      await page.goto(recipeUrl);
      await new Promise((r) => setTimeout(r, 3000));
      const res = await scrapRecipe(page);
      console.log(res);
      if (res) {
        db.push({ ...res, recipeUrl });
        saveData(db, preppyPath);
      }
    }
    if (nextPage) {
      await page.goto(nextPage);
      await new Promise((r) => setTimeout(r, 3000));
      entryLinks = await page.$$eval('a.entry-image-link', (els) => els.map((el) => el.href));
    } else {
      entryLinks = null;
      break;
    }
  }
  return true;
};

const main = async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium-browser',
    headless: false,
  });
  // const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(preppyUrl);
  await new Promise((r) => setTimeout(r, 3000));
  const db = fs.existsSync(preppyPath) ? loadData(preppyPath) : [];

  const catLinks = await page.$$eval('.feast-category-index-list > li > a', (els) => els.map((el) => el.href));
  for (let i = 0; i < 23; i += 1) {
    await page.goto(catLinks[i]);
    await new Promise((r) => setTimeout(r, 3000));
    await scrapCategory(page, db);
  }

  await browser.close();
};

main();
