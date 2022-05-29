/* eslint-disable no-await-in-loop */
/* eslint-disable no-promise-executor-return */
const puppeteer = require('puppeteer');
const fs = require('fs');

const foodUrl = 'https://foodwishes.blogspot.com/';

const scrapBlog = async (page) => {
  const titles = await page.$$eval('h3.post-title', (els) => els.map((el) => el.textContent));
  const ytLinks = await page.$$eval('a.ytp-title-link', (els) => els.map((el) => el.href));
  const iframes = await page.$$eval('div.post-body > iframe', (els) => els.map((el) => el.getAttribute('src')));
  const labelSpans = await page.$$('span.post-labels');
  console.log('titles', titles);
  console.log('iframes', iframes);
  console.log('links', ytLinks);
  const res = [];
  for (let i = 0; i < titles.length; i += 1) {
    if (titles[i] && iframes[i]) {
      const title = titles[i].split('–')[0].trim();
      const youtubeId = iframes[i]
        ? iframes[i].split('/embed/')[1]
        : ytLinks[i].split('?v=')[1];
      const labels = await labelSpans[i].$$eval('a', (els) => els.map((el) => el.textContent));
      res.push({ title, youtubeId, labels });
    }
  }
  return res;
};

const blogPath = './src/data/blog.json';

const loadData = (path) => JSON.parse(fs.readFileSync(path));

const saveData = (db, path) => {
  fs.writeFileSync(path, JSON.stringify(db));
};

const scrap = async () => {
  /* const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium-browser',
    headless: false,
  }); */
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.goto(foodUrl, {
    waitUntil: 'networkidle2',
    timeout: 0,
  });
  await new Promise((r) => setTimeout(r, 10000));
  let nextBtn = await page.$('a.blog-pager-older-link');
  const maxPages = 60;

  const res = fs.existsSync(blogPath) ? loadData(blogPath) : [];

  for (let p = 0; p < maxPages; p += 1) {
    const blockRes = await scrapBlog(page);
    blockRes.forEach((item) => {
      if (!res.some(({ youtubeId }) => youtubeId === item.youtubeId)) {
        console.log('new recipe', item.title);
        res.push(item);
      }
    });
    console.log('saving page', p, 'recipes total:', res.length);
    saveData(res, blogPath);
    if (nextBtn) {
      const href = await nextBtn.evaluate((el) => el.href);
      console.log('going to page', href);
      page.goto(href, {
        waitUntil: 'networkidle2',
        timeout: 0,
      });
      await new Promise((r) => setTimeout(r, 10000));
      nextBtn = await page.$('a.blog-pager-older-link');
    } else break;
  }

  await browser.close();
};

scrap();
