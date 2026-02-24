#!/bin/bash

# FreeAPI One-Click Installer
# Version: 1.0.0
# Author: naturecode-official
# GitHub: https://github.com/naturecode-official/freeapi

set -e

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Show banner
show_banner() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║                 FreeAPI Installer                        ║"
    echo "║     AI Service Management Tool - One-Click Installer     ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo "GitHub: https://github.com/naturecode-official/freeapi"
    echo
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Detect operating system
detect_os() {
    case "$(uname -s)" in
        Darwin*)
            echo "macos"
            ;;
        Linux*)
            echo "linux"
            ;;
        MINGW*|CYGWIN*|MSYS*)
            echo "windows"
            ;;
        *)
            echo "unknown"
            ;;
    esac
}

# Detect architecture
detect_arch() {
    case "$(uname -m)" in
        x86_64|amd64)
            echo "x64"
            ;;
        aarch64|arm64)
            echo "arm64"
            ;;
        arm*)
            echo "arm"
            ;;
        *)
            echo "unknown"
            ;;
    esac
}

# Check Node.js
check_nodejs() {
    if command_exists node; then
        NODE_VERSION=$(node --version | cut -d'v' -f2)
        log_info "Detected Node.js v$NODE_VERSION"
        
        # Check if version is sufficient
        REQUIRED_VERSION=18
        MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1)
        if [ "$MAJOR_VERSION" -ge "$REQUIRED_VERSION" ]; then
            return 0
        else
            log_error "Node.js version too low (requires v18+, found v$NODE_VERSION)"
            return 1
        fi
    else
        log_error "Node.js not detected"
        return 1
    fi
}

# Install Node.js (macOS)
install_nodejs_macos() {
    log_info "Installing Node.js..."
    
    if command_exists brew; then
        brew install node@18
        brew link --overwrite node@18
    else
        log_error "Please install Homebrew first: https://brew.sh/"
        return 1
    fi
}

# Install Node.js (Linux)
install_nodejs_linux() {
    log_info "Installing Node.js..."
    
    # Detect package manager
    if command_exists apt; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    elif command_exists yum; then
        curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
        sudo yum install -y nodejs
    elif command_exists dnf; then
        curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
        sudo dnf install -y nodejs
    else
        log_error "Unsupported Linux distribution, please install Node.js v18+ manually"
        return 1
    fi
}

# Install Node.js (Windows)
install_nodejs_windows() {
    log_warning "Windows users please install Node.js manually:"
    echo "1. Visit https://nodejs.org/"
    echo "2. Download Node.js v18+ LTS version"
    echo "3. Run the installer"
    echo "4. Reopen terminal"
    return 1
}

# Install Node.js
install_nodejs() {
    OS=$(detect_os)
    
    case "$OS" in
        macos)
            install_nodejs_macos
            ;;
        linux)
            install_nodejs_linux
            ;;
        windows)
            install_nodejs_windows
            ;;
        *)
            log_error "Unsupported operating system"
            return 1
            ;;
    esac
}

# Install FreeAPI
install_freeapi() {
    log_info "Installing FreeAPI..."
    
    # Create temporary directory
    TEMP_DIR=$(mktemp -d)
    cd "$TEMP_DIR"
    
    # Clone repository
    log_info "Downloading FreeAPI source code..."
    if command_exists git; then
        git clone --depth 1 https://github.com/naturecode-official/freeapi.git
        cd freeapi
    else
        log_error "git not installed, trying curl download..."
        curl -L https://github.com/naturecode-official/freeapi/archive/refs/heads/main.tar.gz -o freeapi.tar.gz
        tar -xzf freeapi.tar.gz
        cd freeapi-main
    fi
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm install
    
    # Build project
    log_info "Building project..."
    npm run build
    
    # Install globally
    log_info "Installing FreeAPI globally..."
    npm link
    
    # Clean up
    cd ~
    rm -rf "$TEMP_DIR"
    
    log_success "FreeAPI installation complete!"
}

# Verify installation
verify_installation() {
    log_info "Verifying installation..."
    
    if command_exists freeapi; then
        FREEAPI_VERSION=$(freeapi --version 2>/dev/null || echo "unknown")
        log_success "FreeAPI installed successfully! Version: $FREEAPI_VERSION"
        
        echo
        echo "Installation complete!"
        echo
        echo "Usage:"
        echo "  freeapi --help     Show help"
        echo "  freeapi init       Initialize configuration"
        echo "  freeapi list       List available services"
        echo "  freeapi config     Configure service"
        echo
        echo "Quick start:"
        echo "  1. freeapi init"
        echo "  2. freeapi config chatgpt_web"
        echo "  3. freeapi start chatgpt_web"
        echo "  4. freeapi chat chatgpt_web"
        echo
        echo "Documentation: https://github.com/naturecode-official/freeapi"
        return 0
    else
        log_error "FreeAPI installation failed"
        return 1
    fi
}

# Show system information
show_system_info() {
    OS=$(detect_os)
    ARCH=$(detect_arch)
    
    log_info "System information:"
    echo "  OS: $OS"
    echo "  Architecture: $ARCH"
    echo "  Hostname: $(hostname)"
    echo "  User: $(whoami)"
    echo
}

# Main function
main() {
    show_banner
    show_system_info
    
    # Check Node.js
    if ! check_nodejs; then
        log_warning "Node.js not installed or version too low"
        read -p "Automatically install Node.js? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            install_nodejs
            if ! check_nodejs; then
                log_error "Node.js installation failed, please install manually"
                exit 1
            fi
        else
            log_error "Node.js v18+ required to continue"
            exit 1
        fi
    fi
    
    # Check npm
    if ! command_exists npm; then
        log_error "npm not detected"
        exit 1
    fi
    
    # Install FreeAPI
    install_freeapi
    
    # Verify installation
    verify_installation
}

# Exception handling
trap 'log_error "Installation interrupted"; exit 1' INT TERM

# Run main function
main "$@"