# Use Ubuntu base image for better Playwright support
FROM node:20-slim

# Install system dependencies for Playwright
RUN apt-get update && apt-get install -y \
    curl \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libwayland-client0 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libxss1 \
    libxtst6 \
    ca-certificates \
    fonts-noto-color-emoji \
    tzdata \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy package files and install Node.js dependencies
COPY package*.json ./
RUN npm ci --only=production

# Install Playwright browsers
RUN npx playwright install --with-deps chromium

# Copy the rest of the code
COPY . .

# Expose the port your server runs on
EXPOSE 3030

# Set environment variables for headless operation
ENV DISPLAY=:99
ENV NODE_ENV=production

# Run the server
CMD ["node", "playwright_screenshot_server.js"]
