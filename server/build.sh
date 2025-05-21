#!/bin/bash
set -e

echo "Starting build process..."
echo "Current directory: $(pwd)"
echo "Contents of current directory:"
ls -la

echo "Checking for package.json..."
if [ ! -f "package.json" ]; then
    echo "ERROR: package.json not found in $(pwd)"
    exit 1
fi

echo "Installing dependencies..."
npm install

echo "Installing TypeScript and required types..."
npm install typescript @types/node --save-dev

echo "TypeScript version:"
npx tsc --version

echo "Checking for tsconfig.json..."
if [ ! -f "tsconfig.json" ]; then
    echo "ERROR: tsconfig.json not found in $(pwd)"
    exit 1
fi

echo "Compiling TypeScript..."
npx tsc --project tsconfig.json

echo "Contents of current directory after build:"
ls -la

echo "Contents of dist directory:"
if [ -d "dist" ]; then
    ls -la dist/
else
    echo "ERROR: dist directory not created"
    exit 1
fi

echo "Verifying dist/index.js exists:"
if [ -f "dist/index.js" ]; then
    echo "dist/index.js exists"
    cat dist/index.js | head -n 5
else
    echo "ERROR: dist/index.js does not exist"
    exit 1
fi

echo "Build completed successfully" 