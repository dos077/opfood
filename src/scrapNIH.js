/* eslint-disable no-promise-executor-return */
const puppeteer = require('puppeteer');
const fs = require('fs');

const vitaminUrl = 'https://www.ncbi.nlm.nih.gov/books/NBK56068/table/summarytables.t2/?report=objectonly';
const mineralUrl = 'https://www.ncbi.nlm.nih.gov/books/NBK545442/table/appJ_tab3/?report=objectonly';
const marcoUrl = 'https://www.ncbi.nlm.nih.gov/books/NBK56068/table/summarytables.t4/?report=objectonly';

const scrapMicro = async (page) => {
  const ths = await page.$$eval('th', (els) => els.map((el) => el.textContent));
  const tds = await page.$$eval('td', (els) => els.map((el) => el.textContent));
  const res = [];
  for (let s = 0; s < 2; s += 1) {
    const sex = ['male', 'female'][s];
    const start = tds.findIndex((td) => td.toLowerCase().match(sex));
    const firstCol = tds.findIndex((td, index) => index > start && td.match(' y'));
    for (let y = 0; y < 5; y += 1) {
      const rowIndex = firstCol + y * ths.length;
      const [min, max] = tds[rowIndex].replace(' y', '').split('–');
      for (let x = 1; x < ths.length; x += 1) {
        const name = ths[x].split('(')[0].toLowerCase();
        const unit = ths[x].split('(')[1].split('/')[0];
        const value = tds[rowIndex + x].replace(/[^\d.]/g, '');
        res.push({
          sex,
          name,
          unit,
          min: parseInt(min),
          max: parseInt(max),
          value: parseFloat(value),
        });
      }
    }
  }
  return res;
};

const microPath = './src/data/microRequirement.json';
const macroPath = './src/data/marcoRequirement.json';

const saveData = (db, path) => {
  fs.writeFileSync(path, JSON.stringify(db));
};

const main = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(vitaminUrl);
  await new Promise((r) => setTimeout(r, 2500));
  const res = await scrapMicro(page);

  await page.goto(mineralUrl);
  await new Promise((r) => setTimeout(r, 2500));
  const mineralRes = await scrapMicro(page);
  res.push(...mineralRes);

  saveData(res, microPath);

  await page.goto(marcoUrl);
  await new Promise((r) => setTimeout(r, 2500));
  const marcoRes = await scrapMicro(page);
  saveData(marcoRes, macroPath);

  await browser.close();
};

main();
