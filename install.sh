#!/bin/bash
echo "Installing FreeAPI..."
echo ""

# Check if curl is available
if ! command -v curl &> /dev/null; then
    echo "Error: curl is required. Please install curl first."
    exit 1
fi

# Download directly
echo "Downloading FreeAPI..."
curl -s https://raw.githubusercontent.com/naturecode-official/freeapi/main/index.js -o freeapi

# Make executable
chmod +x freeapi

echo ""
echo "✅ FreeAPI downloaded successfully!"
echo ""
echo "To use FreeAPI:"
echo "  1. Move it to a directory in your PATH:"
echo "     sudo mv freeapi /usr/local/bin/"
echo "  2. Or run it directly:"
echo "     ./freeapi --help"
echo ""
echo "Basic usage:"
echo "  ./freeapi --help    # Show help"
echo "  ./freeapi list      # List services"
echo "  ./freeapi chat      # Start chat"
