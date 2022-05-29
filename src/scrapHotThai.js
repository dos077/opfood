/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-promise-executor-return */
const puppeteer = require('puppeteer');
const fs = require('fs');

const hotThaiPath = './src/data/hotThai.json';
const hotThaiUrl = 'https://hot-thai-kitchen.com/category/all-recipes/';

const loadData = (path) => JSON.parse(fs.readFileSync(path));

const saveData = (db, path) => {
  fs.writeFileSync(path, JSON.stringify(db));
};

const scrapRecipe = async (page) => {
  let title;
  let titleEl = await page.$('h2.wprm-recipe-name');
  let details = null;
  if (titleEl) {
    title = await titleEl.evaluate((el) => el.textContent);
    details = await page.$$eval('div.wprm-recipe-block-container', (els) => els.map((el) => el.textContent));
  } else {
    titleEl = await page.$('h2.tasty-recipes-title');
    if (!titleEl) return false;
    title = await titleEl.evaluate((el) => el.textContent);
    details = await page.$$eval('div.tasty-recipes-details > ul > li', (els) => els.map((el) => el.textContent));
  }
  let cook;
  let prep;
  let servings;
  const labels = [];
  let thumbnail;
  let videoUrl;
  const tnMeta = await page.$('meta[itemprop="thumbnailUrl"]');
  if (tnMeta) {
    videoUrl = await page.url();
    thumbnail = await tnMeta.evaluate((el) => el.content);
  } else {
    const tnDiv = await page.$('div.rll-youtube-player > div > img');
    if (!tnDiv) return false;
    thumbnail = await tnDiv.evaluate((el) => el.src);
    videoUrl = await page.$eval('div.rll-youtube-player', (el) => el.getAttribute('data-src'));
  }
  details.forEach((text) => {
    const nrr = text.replace(/[a-zA-Z]|\:/g, '').trim().split(' ').filter((str) => str !== '');
    if (text.match('servings')) {
      servings = parseInt(nrr[0]);
    } else if (text.match('Cook') || text.match('Prep')) {
      console.log('parsing', text, nrr);
      let time = text.match('hr') ? parseInt(nrr[0]) * 60 : parseInt(nrr[0]);
      if (nrr.length > 1) time += parseInt(nrr[1]);
      if (text.match('Cook')) cook = time;
      else prep = time;
    } else if (text.match('Course') || text.match('Cuisine')) {
      const srr = text.split(' ');
      labels.push(srr.slice(1).join(' '));
    }
  });
  if (!cook) return false;
  return {
    title, cook, prep, total: cook + prep, servings, labels, thumbnail, videoUrl,
  };
};

const scrap = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.goto(hotThaiUrl, {
    waitUntil: 'networkidle2',
    timeout: 0,
  });
  await new Promise((r) => setTimeout(r, 3000));
  let nextHref = null;
  const maxPages = 3;

  const res = fs.existsSync(hotThaiPath) ? loadData(hotThaiPath) : [];

  for (let p = 0; p < maxPages; p += 1) {
    const urls = await page.$$eval('a.entry-image-link', (els) => els.map((el) => el.href));
    const nextBtn = await page.$('li.pagination-next > a');
    nextHref = nextBtn ? await nextBtn.evaluate((el) => el.href) : null;
    for (let i = 0; i < urls.length; i += 1) {
      const recipeUrl = urls[i];
      if (res.some((entry) => entry.recipeUrl === recipeUrl)) continue;
      await page.goto(recipeUrl);
      await new Promise((r) => setTimeout(r, 3300));
      const pageRes = await scrapRecipe(page);
      if (pageRes) {
        console.log(pageRes);
        res.push({ ...pageRes, recipeUrl });
        console.log('saving page', p, 'recipes total:', res.length);
        saveData(res, hotThaiPath);
      }
    }
    if (nextHref) {
      console.log('going to page', nextHref);
      await page.goto(nextHref);
      await new Promise((r) => setTimeout(r, 3000));
    } else break;
  }

  await browser.close();
};

scrap();
