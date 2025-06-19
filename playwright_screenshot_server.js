const { chromium } = require('playwright');
const express = require('express');
const app = express();
const port = 3030;

app.use(express.json());

app.post('/screenshot', async (req, res) => {
  const { url, selector, fullPage, filename } = req.body;

  if (!url) {
    return res.status(400).send({ error: 'URL is required' });
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle' });

    const path = filename || 'screenshot.png';
    if (selector) {
      const element = await page.$(selector);
      if (!element) {
        throw new Error(`Element ${selector} not found`);
      }
      await element.screenshot({ path });
    } else {
      await page.screenshot({ path, fullPage: !!fullPage });
    }

    await browser.close();
    res.send({ success: true, file: path });
  } catch (error) {
    await browser.close();
    res.status(500).send({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`📸 Screenshot service running at http://localhost:${port}`);
});
