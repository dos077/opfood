/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-promise-executor-return */
const puppeteer = require('puppeteer');
const fs = require('fs');

const marionPath = './src/data/marion.json';
const marionSkipPath = './src/data/marionSkip.json';
const youtubeUrl = 'https://www.youtube.com/c/Marionskitchen/videos';

const loadData = (path) => JSON.parse(fs.readFileSync(path));

const saveData = (db, path) => {
  fs.writeFileSync(path, JSON.stringify(db));
};

const scrapRecipe = async (page) => {
  const title = await page.$eval('h1', (el) => el.textContent);
  const recipeUrl = await page.url();
  let cook;
  let prep;
  let servings;
  const details = await page.$$eval('.elementor-column-wrap', (els) => els.map((el) => el.textContent));
  details.forEach((text) => {
    const nrr = text.replace(/\D/g, ' ').trim().split(' ').filter((str) => str !== '');
    if (text.match('SERVES')) {
      servings = parseInt(nrr[0]);
    } else if (text.match('COOK TIME') || text.match('PREP TIME')) {
      console.log('parsing', text, nrr);
      let time = text.match('hour') ? parseInt(nrr[0]) * 60 : parseInt(nrr[0]);
      if (nrr.length > 1) time += parseInt(nrr[1]);
      if (text.match('COOK')) cook = time;
      else prep = time;
    }
  });
  if (!servings) return false;
  const arr = await page.$$eval('a[rel="tag"]', (els) => els.map((el) => el.textContent));
  const labels = arr.filter((str) => !str.match('-'));
  return {
    title, cook, prep, servings, labels, recipeUrl, total: prep + cook,
  };
};

const scrapYoutube = async (page) => {
  let moreBtn = await page.$('#more');
  const btnVis = await moreBtn
    .evaluate((el) => window.getComputedStyle(el).getPropertyValue('display') !== 'none' && el.offsetHeight);
  if (!btnVis) moreBtn = await page.$('#expand');
  await moreBtn.click();
  await new Promise((r) => setTimeout(r, 2000));
  const description = await page.$eval('.ytd-video-secondary-info-renderer', (el) => el.textContent);
  if (!description.match('written recipe') && !description.match('Get the recipe')) return false;
  const reLink = await page.$eval('a[rel="nofollow"]', (el) => el.href);
  return reLink;
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

  const db = fs.existsSync(marionPath) ? loadData(marionPath) : [];
  const skips = fs.existsSync(marionSkipPath) ? loadData(marionSkipPath) : [];

  await page.goto(youtubeUrl);
  await new Promise((r) => setTimeout(r, 2000));
  const youtubeLinks = [];
  let newLinks = await page.$$eval('a.ytd-thumbnail', (els) => els.map((el) => el.href));
  newLinks = newLinks
    .filter((link) => link.match('watch')
      && !db.some(({ videoUrl }) => videoUrl === link));
  while (newLinks && newLinks.length > 0) {
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
    const videoUrl = youtubeLinks[i];
    const youtubeId = videoUrl.split('v=')[1];
    const thumbnail = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
    await page.goto(videoUrl);
    await new Promise((r) => setTimeout(r, 3000));
    const reLink = await scrapYoutube(page);
    skips.push(videoUrl);
    saveData(skips, marionSkipPath);
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
      saveData(db, marionPath);
    }
  }

  await browser.close();
};

main();
