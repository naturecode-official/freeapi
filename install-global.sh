#!/bin/bash

# FreeAPI Global Installation Script
# This script installs FreeAPI globally on your system

set -e

echo "🚀 FreeAPI Global Installation"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
  echo -e "${YELLOW}⚠️  Warning: Running as root. It's recommended to install without sudo.${NC}"
  echo -e "${YELLOW}   Press Ctrl+C to cancel or wait 3 seconds to continue...${NC}"
  sleep 3
fi

# Function to print colored messages
print_message() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check prerequisites
print_message "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
  print_error "Node.js is not installed. Please install Node.js 18 or higher."
  echo "Visit: https://nodejs.org/"
  exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)

if [ "$NODE_MAJOR" -lt 18 ]; then
  print_error "Node.js version $NODE_VERSION is too old. Please upgrade to Node.js 18 or higher."
  exit 1
fi

print_success "Node.js $NODE_VERSION detected"

# Check npm
if ! command -v npm &> /dev/null; then
  print_error "npm is not installed. Please install npm."
  exit 1
fi

NPM_VERSION=$(npm --version)
print_success "npm $NPM_VERSION detected"

# Check if we're in the FreeAPI directory
if [ ! -f "package.json" ] || [ ! -f "src/index.ts" ]; then
  print_error "This script must be run from the FreeAPI project directory."
  echo "Please navigate to the FreeAPI directory and run: ./install-global.sh"
  exit 1
fi

# Read package name and version
PACKAGE_NAME=$(node -p "require('./package.json').name")
PACKAGE_VERSION=$(node -p "require('./package.json').version")

print_message "Installing $PACKAGE_NAME v$PACKAGE_VERSION..."

# Clean previous builds
print_message "Cleaning previous builds..."
rm -rf dist node_modules 2>/dev/null || true

# Install dependencies
print_message "Installing dependencies..."
npm install

# Build the project
print_message "Building TypeScript code..."
npm run build

if [ $? -ne 0 ]; then
  print_error "Build failed. Please check for TypeScript errors."
  exit 1
fi

print_success "Build completed successfully"

# Check if already installed globally
if npm list -g $PACKAGE_NAME --depth=0 2>/dev/null | grep -q $PACKAGE_NAME; then
  print_warning "$PACKAGE_NAME is already installed globally."
  read -p "Do you want to reinstall? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_message "Installation cancelled."
    exit 0
  fi
  print_message "Uninstalling previous version..."
  npm uninstall -g $PACKAGE_NAME 2>/dev/null || true
fi

# Install globally
print_message "Installing globally..."
npm link

if [ $? -ne 0 ]; then
  print_error "Global installation failed."
  exit 1
fi

print_success "$PACKAGE_NAME v$PACKAGE_VERSION installed globally!"

# Verify installation
print_message "Verifying installation..."
if command -v freeapi &> /dev/null; then
  print_success "CLI command 'freeapi' is available"
else
  print_error "CLI command 'freeapi' not found in PATH"
  echo "Please check your PATH environment variable."
  exit 1
fi

# Create user configuration directory
print_message "Setting up user configuration..."
mkdir -p ~/.freeapi/services 2>/dev/null || true

# Test the CLI
print_message "Testing CLI command..."
freeapi --help > /dev/null 2>&1

if [ $? -eq 0 ]; then
  print_success "CLI command works correctly"
else
  print_error "CLI command test failed"
  exit 1
fi

# Display success message
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 FreeAPI Installation Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}📦 What was installed:${NC}"
echo "  • FreeAPI CLI tool (global command: freeapi)"
echo "  • ChatGPT service with API integration"
echo "  • Configuration management system"
echo "  • All dependencies and TypeScript build"
echo ""
echo -e "${BLUE}🚀 Getting Started:${NC}"
echo "  1. Initialize configuration:"
echo -e "     ${YELLOW}freeapi init${NC}"
echo ""
echo "  2. Configure ChatGPT service:"
echo -e "     ${YELLOW}freeapi config chatgpt${NC}"
echo "     or use the interactive wizard:"
echo -e "     ${YELLOW}node -e \"require('./dist/services/chatgpt/exports').runConfigWizard()\"${NC}"
echo ""
echo "  3. Start using FreeAPI:"
echo -e "     ${YELLOW}freeapi list${NC}           - List available services"
echo -e "     ${YELLOW}freeapi start chatgpt${NC}  - Start ChatGPT service"
echo -e "     ${YELLOW}freeapi chat chatgpt${NC}   - Interactive chat"
echo -e "     ${YELLOW}freeapi status${NC}         - Check service status"
echo ""
echo -e "${BLUE}📁 Configuration Directory:${NC}"
echo -e "  ${YELLOW}~/.freeapi/${NC}"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "  • Quick start: cat QUICKSTART.md"
echo "  • ChatGPT service: cat docs/chatgpt-service.md"
echo "  • GitHub: https://github.com/naturecode-official/freeapi"
echo ""
echo -e "${BLUE}🔧 Troubleshooting:${NC}"
echo "  If 'freeapi' command is not found, try:"
echo "  1. Restart your terminal"
echo "  2. Check PATH: echo \$PATH"
echo "  3. Manual link: cd $(pwd) && npm link"
echo ""
echo -e "${GREEN}Happy chatting with AI! 🤖${NC}"
echo ""

# Optional: Run initialization
read -p "Do you want to run 'freeapi init' now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  print_message "Running freeapi init..."
  freeapi init
fi