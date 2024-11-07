const express = require('express');
const serverless = require('serverless-http');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const cors = require('cors');

const app = express();
const router = express.Router();

router.get('/test', async (req, res) => {
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();
  await page.goto('https://www.newtimes.co.rw/');
                  
const title = await page.title();
  await browser.close();
  res.send(title);
});

app.use(cors({
    origin: '*'
}));

app.use('/.netlify/functions/api', router);
module.exports.handler = serverless(app);