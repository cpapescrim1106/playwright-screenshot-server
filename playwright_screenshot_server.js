const { chromium } = require('playwright');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { URL } = require('url');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = process.env.PORT || 3030;

// Global browser instance for reuse
let globalBrowser = null;

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(limiter);

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Utility function to validate URL
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// Get or create browser instance
async function getBrowser() {
  if (!globalBrowser || !globalBrowser.isConnected()) {
    console.log('Launching new browser instance...');
    globalBrowser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
  }
  return globalBrowser;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    browserConnected: globalBrowser ? globalBrowser.isConnected() : false
  });
});

// Main screenshot endpoint
app.post('/screenshot', async (req, res) => {
  const { 
    url, 
    selector, 
    fullPage = false, 
    filename,
    format = 'png',
    quality = 80,
    width = 1920,
    height = 1080,
    waitFor = 'networkidle',
    timeout = 30000,
    returnBase64 = true,
    mobile = false
  } = req.body;

  // Validation
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (!isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL provided' });
  }

  if (!['png', 'jpeg', 'webp'].includes(format)) {
    return res.status(400).json({ error: 'Format must be png, jpeg, or webp' });
  }

  let page = null;
  
  try {
    const browser = await getBrowser();
    page = await browser.newPage();

    // Mobile emulation if requested (override viewport settings)
    if (mobile) {
      // iPhone 12 simulation - just use mobile viewport
      await page.setViewportSize({ width: 390, height: 844 });
    } else {
      // Configure viewport
      await page.setViewportSize({ width, height });
    }

    // Set timeout
    page.setDefaultTimeout(timeout);

    // Navigate to URL
    const waitUntilOptions = {
      'load': 'load',
      'domcontentloaded': 'domcontentloaded',
      'networkidle': 'networkidle'
    };

    await page.goto(url, { 
      waitUntil: waitUntilOptions[waitFor] || 'networkidle',
      timeout 
    });

    // Take screenshot
    const screenshotOptions = { 
      fullPage: !!fullPage,
      type: format
    };

    if (format === 'jpeg') {
      screenshotOptions.quality = quality;
    }

    let screenshotBuffer;

    if (selector) {
      const element = await page.$(selector);
      if (!element) {
        throw new Error(`Element "${selector}" not found`);
      }
      screenshotBuffer = await element.screenshot(screenshotOptions);
    } else {
      screenshotBuffer = await page.screenshot(screenshotOptions);
    }

    // Handle response
    if (returnBase64) {
      const base64Data = screenshotBuffer.toString('base64');
      const mimeType = `image/${format === 'jpeg' ? 'jpeg' : format}`;
      
      res.json({
        success: true,
        image: base64Data,
        mimeType,
        size: screenshotBuffer.length,
        dimensions: { width, height },
        url: url,
        timestamp: new Date().toISOString()
      });
    } else {
      // Save to file and return path
      const outputPath = filename || `screenshot-${Date.now()}.${format}`;
      await fs.writeFile(outputPath, screenshotBuffer);
      
      res.json({
        success: true,
        file: outputPath,
        size: screenshotBuffer.length,
        dimensions: { width, height },
        url: url,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Screenshot error:', error);
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  } finally {
    if (page) {
      await page.close().catch(console.error);
    }
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  if (globalBrowser) {
    await globalBrowser.close();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  if (globalBrowser) {
    await globalBrowser.close();
  }
  process.exit(0);
});

app.listen(port, () => {
  console.log(`📸 Screenshot service running at http://localhost:${port}`);
  console.log(`Health check available at http://localhost:${port}/health`);
});