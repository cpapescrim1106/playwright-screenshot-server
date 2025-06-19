#!/usr/bin/env node

const http = require('http');
const https = require('https');

// Test configurations
const configs = {
  local: {
    name: '🏠 Local Server',
    url: 'http://localhost:3030',
    module: http
  },
  deployed: {
    name: '☁️  Deployed Server (CapRover)',
    url: 'https://playwright-screenshot-server.srv835477.hstgr.cloud',
    module: https
  }
};

async function makeRequest(config, path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(config.url + path);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + (url.search || ''),
      method: method,
      headers: {
        'User-Agent': 'Screenshot-Server-Test/1.0'
      }
    };

    if (data) {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }

    const req = config.module.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: responseData
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

async function testHealth(config) {
  console.log(`\n🏥 Testing Health Check - ${config.name}`);
  console.log(`📍 URL: ${config.url}/health`);
  
  try {
    const response = await makeRequest(config, '/health');
    
    if (response.statusCode === 200) {
      try {
        const data = JSON.parse(response.body);
        console.log(`✅ Health: ${data.status}`);
        console.log(`🕐 Timestamp: ${data.timestamp}`);
        console.log(`🌐 Browser Connected: ${data.browserConnected}`);
        return true;
      } catch (e) {
        console.log(`❌ Invalid JSON response`);
        console.log(`📄 Response: ${response.body.substring(0, 200)}...`);
        return false;
      }
    } else {
      console.log(`❌ HTTP ${response.statusCode}`);
      console.log(`📄 Response: ${response.body.substring(0, 200)}...`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Connection Error: ${error.message}`);
    return false;
  }
}

async function testScreenshot(config, testName, requestData) {
  console.log(`\n📸 Testing Screenshot - ${config.name}`);
  console.log(`🧪 Test: ${testName}`);
  console.log(`📋 Request: ${JSON.stringify(requestData, null, 2)}`);
  
  try {
    const data = JSON.stringify(requestData);
    const response = await makeRequest(config, '/screenshot', 'POST', data);
    
    if (response.statusCode === 200) {
      try {
        const result = JSON.parse(response.body);
        if (result.success) {
          console.log(`✅ Success!`);
          console.log(`📊 Size: ${result.size} bytes`);
          console.log(`📐 Dimensions: ${JSON.stringify(result.dimensions)}`);
          console.log(`🎨 Format: ${result.mimeType}`);
          console.log(`🔗 URL: ${result.url}`);
          console.log(`📷 Image Preview: ${result.image ? result.image.substring(0, 50) + '...' : 'N/A'}`);
          return true;
        } else {
          console.log(`❌ Screenshot Failed: ${result.error}`);
          return false;
        }
      } catch (e) {
        console.log(`❌ Invalid JSON response`);
        console.log(`📄 Response: ${response.body.substring(0, 200)}...`);
        return false;
      }
    } else {
      console.log(`❌ HTTP ${response.statusCode}`);
      console.log(`📄 Response: ${response.body.substring(0, 200)}...`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Request Error: ${error.message}`);
    return false;
  }
}

async function runAllTests(config) {
  console.log(`\n🚀 Starting Tests for ${config.name}`);
  console.log(`🔗 Base URL: ${config.url}`);
  
  let passed = 0;
  let total = 0;
  
  // Test 1: Health Check
  total++;
  if (await testHealth(config)) passed++;
  
  // Only continue with screenshot tests if health check passes
  if (passed > 0) {
    // Test 2: Basic Screenshot
    total++;
    if (await testScreenshot(config, 'Basic Screenshot', {
      url: 'https://example.com',
      width: 800,
      height: 600
    })) passed++;
    
    // Test 3: Element Screenshot
    total++;
    if (await testScreenshot(config, 'Element Screenshot', {
      url: 'https://example.com',
      selector: 'h1',
      width: 400,
      height: 300
    })) passed++;
    
    // Test 4: JPEG Format
    total++;
    if (await testScreenshot(config, 'JPEG Format', {
      url: 'https://example.com',
      format: 'jpeg',
      quality: 85,
      width: 600,
      height: 400
    })) passed++;
    
    // Test 5: Mobile Emulation
    total++;
    if (await testScreenshot(config, 'Mobile Emulation', {
      url: 'https://example.com',
      mobile: true
    })) passed++;
  }
  
  console.log(`\n📊 Results for ${config.name}: ${passed}/${total} tests passed`);
  return { passed, total, name: config.name };
}

async function main() {
  console.log('🧪 Playwright Screenshot Server - Deployment Test Suite');
  console.log('═'.repeat(60));
  
  const results = [];
  
  // Test local server
  results.push(await runAllTests(configs.local));
  
  // Test deployed server
  results.push(await runAllTests(configs.deployed));
  
  // Final summary
  console.log('\n🎯 FINAL SUMMARY');
  console.log('═'.repeat(60));
  
  results.forEach(result => {
    const status = result.passed === result.total ? '✅' : '❌';
    console.log(`${status} ${result.name}: ${result.passed}/${result.total} tests passed`);
  });
  
  const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
  const totalTests = results.reduce((sum, r) => sum + r.total, 0);
  
  console.log(`\n🏆 Overall: ${totalPassed}/${totalTests} tests passed`);
  
  if (totalPassed === totalTests) {
    console.log('🎉 All tests passed! Your screenshot server is working perfectly!');
  } else {
    console.log('⚠️  Some tests failed. Check the logs above for details.');
  }
}

// Run tests
main().catch(console.error);