#!/usr/bin/env node

const http = require('http');

async function testScreenshot(testName, requestData) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(requestData);
    
    const options = {
      hostname: 'localhost',
      port: 3030,
      path: '/screenshot',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    console.log(`\n🧪 Testing: ${testName}`);
    console.log(`📋 Request: ${JSON.stringify(requestData, null, 2)}`);
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          
          if (response.success) {
            console.log(`✅ Success!`);
            console.log(`📊 Response: {
  success: ${response.success},
  mimeType: "${response.mimeType}",
  size: ${response.size} bytes,
  dimensions: ${JSON.stringify(response.dimensions)},
  imagePreview: "${response.image.substring(0, 50)}..."
}`);
          } else {
            console.log(`❌ Error: ${response.error}`);
          }
          
          resolve(response);
        } catch (error) {
          console.log(`❌ Parse Error: ${error.message}`);
          console.log(`📄 Raw response: ${responseData}`);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Request Error: ${error.message}`);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function testHealthCheck() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3030,
      path: '/health',
      method: 'GET'
    };

    console.log(`\n🏥 Testing: Health Check`);
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          console.log(`✅ Health: ${response.status}`);
          console.log(`📊 Response: ${JSON.stringify(response, null, 2)}`);
          resolve(response);
        } catch (error) {
          console.log(`❌ Parse Error: ${error.message}`);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Request Error: ${error.message}`);
      reject(error);
    });

    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting Playwright Screenshot Server Tests\n');
  
  try {
    // Test health check
    await testHealthCheck();
    
    // Test 1: Basic screenshot
    await testScreenshot('Basic Screenshot', {
      url: 'https://example.com',
      width: 800,
      height: 600
    });
    
    // Test 2: Element screenshot
    await testScreenshot('Element Screenshot', {
      url: 'https://example.com',
      selector: 'h1',
      width: 400,
      height: 200
    });
    
    // Test 3: JPEG format
    await testScreenshot('JPEG Format', {
      url: 'https://example.com',
      format: 'jpeg',
      quality: 85,
      width: 600,
      height: 400
    });
    
    // Test 4: Mobile emulation (fixed)
    await testScreenshot('Mobile Emulation', {
      url: 'https://example.com',
      mobile: true,
      format: 'png'
    });
    
    // Test 5: Full page screenshot
    await testScreenshot('Full Page Screenshot', {
      url: 'https://example.com',
      fullPage: true,
      width: 1024,
      height: 768
    });
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    await testHealthCheck();
    console.log('✅ Server is running, proceeding with tests...');
    return true;
  } catch (error) {
    console.log('❌ Server not running. Please start the server first:');
    console.log('   npm start');
    return false;
  }
}

// Run tests if server is available
checkServer().then((serverRunning) => {
  if (serverRunning) {
    runTests();
  }
});