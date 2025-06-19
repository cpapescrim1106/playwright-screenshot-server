# Use a lightweight Node base image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Expose the port your server runs on
EXPOSE 3030

# Run the server
CMD ["node", "playwright_screenshot_server.js"]
