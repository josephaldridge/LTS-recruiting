#!/bin/bash
set -e

echo "Current directory: $(pwd)"
echo "Contents of current directory:"
ls -la

echo "Installing dependencies..."
npm install

echo "Installing TypeScript..."
npm install typescript @types/node --save-dev

echo "TypeScript version:"
npx tsc --version

echo "Compiling TypeScript..."
npx tsc --project tsconfig.json

echo "Contents of current directory after build:"
ls -la

echo "Contents of dist directory:"
ls -la dist/

echo "Verifying dist/index.js exists:"
if [ -f "dist/index.js" ]; then
    echo "dist/index.js exists"
else
    echo "ERROR: dist/index.js does not exist"
    exit 1
fi 