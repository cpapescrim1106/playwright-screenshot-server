#!/bin/bash

# Replace YOUR_GITHUB_USERNAME with your actual GitHub username
GITHUB_USERNAME="YOUR_GITHUB_USERNAME"

echo "Setting up remote origin..."
git remote add origin "https://github.com/${GITHUB_USERNAME}/playwright-screenshot-server.git"

echo "Pushing to GitHub..."
git branch -M main
git push -u origin main

echo "Done! Your repository is now on GitHub."