#!/bin/bash
echo "FreeAPI Installer"
echo "================="
echo ""

# Download the script
echo "Downloading FreeAPI..."
curl -s https://raw.githubusercontent.com/naturecode-official/freeapi/main/index.js -o freeapi.js

# Make executable
chmod +x freeapi.js

echo ""
echo "✅ Download complete!"
echo ""
echo "To use FreeAPI:"
echo "  ./freeapi.js --help    # Run directly"
echo ""
echo "To install globally:"
echo "  sudo mv freeapi.js /usr/local/bin/freeapi"
echo ""
echo "Or install to your user directory:"
echo "  mkdir -p ~/.local/bin"
echo "  mv freeapi.js ~/.local/bin/freeapi"
echo "  echo 'export PATH=\"\$HOME/.local/bin:\$PATH\"' >> ~/.bashrc  # or ~/.zshrc"
echo ""
