#!/bin/bash

set -e

echo "Building GitHub Health Monitor..."

# Clean previous build
echo "Cleaning dist directory..."
rm -rf dist
mkdir -p dist

# Compile TypeScript
echo "Compiling TypeScript..."
npx tsc

# Check if compilation succeeded
if [ $? -eq 0 ]; then
    echo "✓ TypeScript compilation successful"
else
    echo "✗ TypeScript compilation failed"
    exit 1
fi

# Make CLI executable
echo "Setting executable permissions..."
chmod +x dist/index.js

# Verify build
echo "Verifying build..."
if [ -f "dist/index.js" ] && [ -x "dist/index.js" ]; then
    echo "✓ Build successful - dist/index.js is executable"
    echo ""
    echo "Build output:"
    ls -la dist/
else
    echo "✗ Build verification failed"
    exit 1
fi

echo ""
echo "Build complete! Run with: node dist/index.js"