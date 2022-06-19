/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-promise-executor-return */
const puppeteer = require('puppeteer');
const fs = require('fs');

const dataPath = './src/data/fwTube.json';
const skipPath = './src/data/fwSkips.json';
const youtubeUrl = 'https://www.youtube.com/c/foodwishes/videos';

const loadData = (path) => JSON.parse(fs.readFileSync(path));

const saveData = (db, path) => {
  fs.writeFileSync(path, JSON.stringify(db));
};

const scrapRecipe = async (page) => {
  const title = await page.$eval('h1', (el) => el.textContent);
  const recipeUrl = await page.url();
  let cook;
  let prep;
  let total;
  let servings;
  const details = await page.$$eval('.recipe-meta-item', (els) => els.map((el) => el.textContent));
  details.forEach((text) => {
    const nrr = text.replace(/\D/g, ' ').trim().split(' ').filter((str) => str !== '');
    if (text.match('ervings')) {
      servings = parseInt(nrr[0]);
    } else if (text.match('cook') || text.match('prep') || (text.match('total'))) {
      console.log('parsing', text, nrr);
      let time = text.match('hr') ? parseInt(nrr[0]) * 60 : parseInt(nrr[0]);
      if (nrr.length > 1) time += parseInt(nrr[1]);
      if (text.match('cook')) cook = time;
      else if (text.match('total'))total = time;
      else prep = time;
    }
  });
  if (!servings) return false;
  const categories = await page.$$eval('.breadcrumbs__title', (els) => els.map((el) => el.textContent));
  const labels = [];
  labels.push(categories[categories.length - 1]);
  labels.push(categories[categories.length - 2]);
  return {
    title, cook, prep, servings, labels, recipeUrl, total,
  };
};

const scrapYoutube = async (page) => {
  let moreBtn = await page.$('#more');
  const btnVis = await moreBtn
    .evaluate((el) => window.getComputedStyle(el).getPropertyValue('display') !== 'none' && el.offsetHeight);
  if (!btnVis) moreBtn = await page.$('#expand');
  await moreBtn.click();
  await new Promise((r) => setTimeout(r, 2000));
  const reLinks = await page.$$eval(
    'a[rel="nofollow"]',
    (els) => els.map((el) => ({ url: el.href, text: el.textContent })),
  );
  const allRecipeLink = reLinks.find(({ text }) => text.match('www.allrecipes.com'));
  return allRecipeLink ? allRecipeLink.url : false;
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
  // const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const db = fs.existsSync(dataPath) ? loadData(dataPath) : [];
  const skips = fs.existsSync(skipPath) ? loadData(skipPath) : [];

  await page.goto(youtubeUrl);
  await new Promise((r) => setTimeout(r, 2000));
  const youtubeLinks = [];
  let newLinks = await page.$$eval('a.ytd-thumbnail', (els) => els.map((el) => el.href));
  newLinks = newLinks
    .filter((link) => link.match('watch')
      && !db.some(({ videoUrl }) => videoUrl === link));
  while (newLinks && newLinks.length > 0 && youtubeLinks.length < 99) {
    const filteredLinks = newLinks.filter((link) => !skips.includes(link));
    youtubeLinks.push(...filteredLinks);
    await page.keyboard.press('PageDown');
    await new Promise((r) => setTimeout(r, 2000));
    await page.keyboard.press('PageDown');
    await new Promise((r) => setTimeout(r, 2000));
    newLinks = await page.$$eval('a.ytd-thumbnail', (els) => els.map((el) => el.href));
    newLinks = newLinks
      .filter((link) => link.match('watch')
        && !db.some(({ videoUrl }) => videoUrl === link)
        && !youtubeLinks.includes(link));
  }

  for (let i = 0; i < youtubeLinks.length; i += 1) {
    console.log(i + 1, '/', youtubeLinks.length);
    const videoUrl = youtubeLinks[i];
    const youtubeId = videoUrl.split('v=')[1];
    const thumbnail = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
    await page.goto(videoUrl);
    await new Promise((r) => setTimeout(r, 3000));
    const reLink = await scrapYoutube(page);
    skips.push(videoUrl);
    saveData(skips, skipPath);
    if (!reLink) continue;
    await page.goto(reLink);
    await new Promise((r) => setTimeout(r, 2000));
    const res = await scrapRecipe(page);
    if (res) {
      db.push({
        ...res,
        videoUrl,
        thumbnail,
      });
      saveData(db, dataPath);
    }
  }

  await browser.close();
};

main();
