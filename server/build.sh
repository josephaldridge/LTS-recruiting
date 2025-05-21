#!/bin/bash
set -e

echo "Current directory: $(pwd)"
echo "Installing dependencies..."
npm install

echo "Installing TypeScript..."
npm install typescript --save-dev

echo "TypeScript version:"
npx tsc --version

echo "Compiling TypeScript..."
npx tsc

echo "Contents of current directory:"
ls -la

echo "Contents of dist directory:"
ls -la dist/ 