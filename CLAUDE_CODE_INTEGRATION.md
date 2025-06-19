# Claude Code Integration Guide

Your Playwright Screenshot Server is now fully optimized for Claude Code integration! Here's how Claude Code can use your server:

## 🚀 Quick Start

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Server runs on:** `http://localhost:3030`

3. **Health check:** `GET http://localhost:3030/health`

## 📸 Taking Screenshots for Claude Code

### Basic Web Page Screenshot
```bash
curl -X POST http://localhost:3030/screenshot \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "width": 1200,
    "height": 800
  }'
```

### Element-Specific Screenshot
```bash
curl -X POST http://localhost:3030/screenshot \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.com",
    "selector": ".error-message",
    "width": 800,
    "height": 600
  }'
```

### Mobile View Screenshot
```bash
curl -X POST http://localhost:3030/screenshot \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.com",
    "mobile": true
  }'
```

## 🔧 Claude Code Use Cases

### 1. **Visual Debugging**
Claude Code can capture screenshots of your web applications to:
- Show current state of UI during development
- Capture error states for debugging
- Visualize layout issues

### 2. **Progress Monitoring**
- Take before/after screenshots when making changes
- Compare different viewport sizes
- Monitor responsive design behavior

### 3. **Element Analysis**
- Capture specific components using CSS selectors
- Isolate problematic UI elements
- Focus on particular areas of the page

### 4. **Documentation**
- Generate visual documentation of UI states
- Create screenshots for bug reports
- Provide visual feedback to users

## 📋 Response Format

The server returns screenshots as **base64-encoded images** that Claude Code can immediately process:

```json
{
  "success": true,
  "image": "iVBORw0KGgoAAAANSUhEUgAA...", 
  "mimeType": "image/png",
  "size": 22441,
  "dimensions": {"width": 800, "height": 600},
  "url": "https://example.com",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🎯 Key Features for Claude Code

### ✅ **Immediate Response**
- No file system dependencies
- Base64 image data returned directly
- Claude Code can process images immediately

### ✅ **Element Targeting**
- Use CSS selectors to capture specific elements
- Perfect for debugging particular components
- Isolate problem areas

### ✅ **Multiple Formats**
- PNG (default, lossless)
- JPEG (smaller file size)
- WebP (modern, efficient)

### ✅ **Responsive Testing**
- Mobile emulation
- Custom viewport sizes
- Test different screen resolutions

### ✅ **Reliable Performance**
- Browser instance reuse
- Rate limiting protection
- Graceful error handling
- Health monitoring

## 🛠 Advanced Options

### Full Configuration Example
```json
{
  "url": "https://your-app.com",
  "selector": ".my-component",
  "fullPage": false,
  "format": "png",
  "quality": 90,
  "width": 1920,
  "height": 1080,
  "waitFor": "networkidle",
  "timeout": 30000,
  "returnBase64": true,
  "mobile": false
}
```

### Wait Strategies
- `"networkidle"` - Wait for network to be idle (default)
- `"load"` - Wait for load event
- `"domcontentloaded"` - Wait for DOM to be ready

## 🔐 Security Features

- ✅ URL validation prevents SSRF attacks
- ✅ Rate limiting (30 requests/minute per IP)
- ✅ Input sanitization and validation
- ✅ CORS headers for controlled access
- ✅ Resource timeouts and cleanup

## 📊 Monitoring

### Health Check Response
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "browserConnected": true
}
```

### Error Responses
```json
{
  "error": "Element \".non-existent\" not found",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🚢 Deployment

### Local Development
```bash
npm start
```

### Docker
```bash
docker build -t playwright-screenshot-server .
docker run -p 3030:3030 playwright-screenshot-server
```

### CapRover (Production)
```bash
./deploy.sh
```

## 🧪 Testing

Run the comprehensive test suite:
```bash
node test-server.js
```

This tests all functionality including:
- ✅ Health checks
- ✅ Basic screenshots
- ✅ Element screenshots
- ✅ Different formats (PNG, JPEG)
- ✅ Mobile emulation
- ✅ Full page screenshots

## 💡 Tips for Claude Code Integration

1. **Always check health** before taking screenshots
2. **Use specific selectors** for targeted debugging
3. **Choose appropriate formats** (PNG for quality, JPEG for size)
4. **Set reasonable timeouts** for complex pages
5. **Monitor response sizes** for performance

Your server is now ready to be used as a powerful visual debugging and feedback tool for Claude Code! 🎉