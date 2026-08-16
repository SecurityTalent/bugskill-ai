#!/bin/bash
#
# Installation script for hakrawler and gospider
# Requires Go to be installed
#

set -e

echo "==================================="
echo "Installing Crawling Tools"
echo "==================================="
echo ""

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo "[!] Go is not installed. Please install Go first:"
    echo "    https://golang.org/doc/install"
    exit 1
fi

echo "[*] Go found: $(go version)"
echo ""

# Install hakrawler
echo "[*] Installing hakrawler..."
go install github.com/hakluke/hakrawler@latest
if command -v hakrawler &> /dev/null; then
    echo "[+] hakrawler installed successfully"
else
    echo "[!] hakrawler installation may have failed"
fi
echo ""

# Install gospider
echo "[*] Installing gospider..."
go install github.com/jaeles-project/gospider@latest
if command -v gospider &> /dev/null; then
    echo "[+] gospider installed successfully"
else
    echo "[!] gospider installation may have failed"
fi
echo ""

# Check PATH
if [[ ":$PATH:" != *":$HOME/go/bin:"* ]]; then
    echo "[!] Warning: ~/go/bin is not in your PATH"
    echo ""
    echo "Add this to your ~/.bashrc or ~/.zshrc:"
    echo "    export PATH=\$PATH:\$HOME/go/bin"
    echo ""
fi

echo "==================================="
echo "Installation complete!"
echo "==================================="
echo ""
echo "Verify installations:"
echo "  hakrawler -h"
echo "  gospider -h"
