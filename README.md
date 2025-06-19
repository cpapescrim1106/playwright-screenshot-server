# Playwright Screenshot Server for Claude Code

A high-performance screenshot service built with Playwright and Express, optimized for integration with Claude Code.

## Features

- **Base64 Image Return**: Screenshots returned as base64 data for immediate use
- **Browser Instance Reuse**: Efficient resource management with persistent browser instances
- **CORS Support**: Cross-origin requests enabled for web integration
- **Rate Limiting**: Built-in protection against abuse (30 requests/minute per IP)
- **Multiple Formats**: Support for PNG, JPEG, and WebP formats
- **Element Screenshots**: Capture specific elements using CSS selectors
- **Mobile Emulation**: iPhone 12 device emulation support
- **Configurable Options**: Viewport size, quality, wait strategies, and timeouts
- **Health Monitoring**: `/health` endpoint for service monitoring
- **Security Features**: URL validation and SSRF protection

## API Endpoints

### POST `/screenshot`

Capture a screenshot of a web page or specific element.

**Request Body:**
```json
{
  "url": "https://example.com",           // Required: URL to screenshot
  "selector": ".my-element",              // Optional: CSS selector for element screenshot
  "fullPage": false,                      // Optional: Capture full page (default: false)
  "format": "png",                        // Optional: png|jpeg|webp (default: png)
  "quality": 80,                          // Optional: JPEG quality 1-100 (default: 80)
  "width": 1920,                          // Optional: Viewport width (default: 1920)
  "height": 1080,                         // Optional: Viewport height (default: 1080)
  "waitFor": "networkidle",               // Optional: load|domcontentloaded|networkidle
  "timeout": 30000,                       // Optional: Timeout in ms (default: 30000)
  "returnBase64": true,                   // Optional: Return base64 data (default: true)
  "mobile": false,                        // Optional: Use mobile emulation (default: false)
  "filename": "custom-name.png"           // Optional: Custom filename when saving to disk
}
```

**Response (Base64 mode):**
```json
{
  "success": true,
  "image": "iVBORw0KGgoAAAANSUhEUgAA...",  // Base64 encoded image
  "mimeType": "image/png",
  "size": 45678,
  "dimensions": { "width": 1920, "height": 1080 },
  "url": "https://example.com",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### GET `/health`

Check service health and status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "browserConnected": true
}
```

## Usage Examples

### Basic Screenshot
```bash
curl -X POST http://localhost:3030/screenshot \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### Element Screenshot with Mobile Emulation
```bash
curl -X POST http://localhost:3030/screenshot \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "selector": ".header",
    "mobile": true,
    "format": "jpeg",
    "quality": 90
  }'
```

### Full Page Screenshot Saved to File
```bash
curl -X POST http://localhost:3030/screenshot \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "fullPage": true,
    "returnBase64": false,
    "filename": "full-page.png"
  }'
```

## Installation & Setup

### Local Development
```bash
npm install
npm start
```

### Docker Deployment
```bash
docker build -t playwright-screenshot-server .
docker run -p 3030:3030 playwright-screenshot-server
```

### CapRover Deployment
```bash
./deploy.sh
```

## Claude Code Integration

This server is specifically designed to work as a tool for Claude Code. The base64 response format allows Claude Code to:

1. **Receive Screenshots Immediately**: No file system dependencies
2. **Process Images Directly**: Base64 data can be embedded in responses
3. **Debug Web Applications**: Capture current state for analysis
4. **Visual Feedback**: Show users what the application looks like

### Example Claude Code Usage

When Claude Code integrates with this server, it can:

- Capture screenshots of web applications during development
- Show visual feedback of changes made to web pages
- Debug layout issues by capturing specific elements
- Monitor web application state during testing

## Environment Variables

- `PORT`: Server port (default: 3030)
- `CAPROVER_TOKEN`: CapRover deployment token

## Error Handling

The server provides detailed error responses:

```json
{
  "error": "Element \".non-existent\" not found",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

Common error scenarios:
- Invalid or missing URL
- Element not found (for selector screenshots)
- Network timeouts
- Invalid format specifications
- Rate limit exceeded

## Security

- URL validation prevents SSRF attacks
- Rate limiting protects against abuse
- Non-root user in Docker container
- Input sanitization and validation
- CORS headers for controlled access