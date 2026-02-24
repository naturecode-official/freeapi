# FreeAPI Installation Guide

## One-Click Installation (Recommended)

### macOS / Linux
```bash
# Method 1: Using curl (simplest)
curl -fsSL https://raw.githubusercontent.com/naturecode-official/freeapi/main/install-freeapi | bash

# Method 2: Download script and run
curl -fsSL https://raw.githubusercontent.com/naturecode-official/freeapi/main/install.sh -o install.sh
chmod +x install.sh
./install.sh
```

### Windows
```powershell
# Method 1: PowerShell
PowerShell -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/naturecode-official/freeapi/main/install.ps1 | iex"

# Method 2: Download script and run
# 1. Download install.ps1
# 2. Run in PowerShell: PowerShell -ExecutionPolicy Bypass -File install.ps1
```

## Manual Installation

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Installation Steps
```bash
# 1. Clone repository
git clone https://github.com/naturecode-official/freeapi.git
cd freeapi

# 2. Install dependencies
npm install

# 3. Build project
npm run build

# 4. Install globally
npm link

# 5. Verify installation
freeapi --help
```

## Package Manager Installation

### macOS (Homebrew)
```bash
# Add tap (after release)
brew tap naturecode-official/freeapi
brew install freeapi
```

### Linux (APT)
```bash
# Add repository (after release)
curl -fsSL https://packagecloud.io/naturecode-official/freeapi/gpgkey | sudo apt-key add -
echo "deb https://packagecloud.io/naturecode-official/freeapi/ubuntu/ focal main" | sudo tee /etc/apt/sources.list.d/freeapi.list
sudo apt update
sudo apt install freeapi
```

### Windows (Chocolatey)
```powershell
# After release
choco install freeapi
```

### Windows (Scoop)
```powershell
# After release
scoop bucket add freeapi https://github.com/naturecode-official/freeapi-scoop
scoop install freeapi
```

## Install from npm (after release)
```bash
npm install -g freeapi
```

## Verify Installation

After installation, run these commands to verify:
```bash
freeapi --version
freeapi --help
```

You should see output similar to:
```
FreeAPI v0.1.0
A tool that runs multiple AI web-based free chat services
```

## Quick Start

1. **Initialize configuration**
   ```bash
   freeapi init
   ```

2. **List available services**
   ```bash
   freeapi list
   ```

3. **Configure a service**
   ```bash
   freeapi config chatgpt_web
   ```

4. **Start using**
   ```bash
   freeapi chat chatgpt_web
   ```

## Troubleshooting

### Common Issues

#### 1. Command not found
```bash
# Check if linked
npm link

# Or use full path
node /path/to/freeapi/bin/freeapi --help
```

#### 2. Node.js version too low
```bash
# Upgrade Node.js
# macOS
brew upgrade node

# Linux (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Windows: Re-download installer
```

#### 3. Permission issues
```bash
# macOS/Linux: Use sudo
sudo npm link

# Or fix npm permissions
sudo chown -R $(whoami) ~/.npm
```

#### 4. Network issues
```bash
# Use mirror
npm config set registry https://registry.npmmirror.com

# Or use proxy
npm config set proxy http://proxy.example.com:8080
```

### Getting Help
- Documentation: `docs/` directory
- GitHub Issues: https://github.com/naturecode-official/freeapi/issues
- Discussions: https://github.com/naturecode-official/freeapi/discussions

## Uninstallation

### npm installation
```bash
npm uninstall -g freeapi
```

### Manual installation
```bash
# Remove global link
npm unlink freeapi

# Remove configuration files
rm -rf ~/.freeapi
```

### Homebrew installation
```bash
brew uninstall freeapi
brew untap naturecode-official/freeapi
```

## Update

### Automatic update (future versions)
```bash
freeapi update
```

### Manual update
```bash
# Reinstall latest version
npm install -g freeapi@latest

# Or update from source
cd ~/freeapi
git pull
npm install
npm run build
npm link
```

## System Requirements

### Minimum Requirements
- **Operating System**: Windows 10 / macOS 10.15+ / Linux (Ubuntu 20.04+)
- **Memory**: 2GB RAM
- **Disk Space**: 500MB
- **Network**: Broadband internet connection

### Recommended Configuration
- **Operating System**: Windows 11 / macOS 12+ / Linux (Ubuntu 22.04+)
- **Memory**: 4GB RAM or higher
- **Disk Space**: 1GB
- **Node.js**: v20+ LTS

## Supported Platforms

| Platform | Support Status | Installation Method |
|----------|----------------|---------------------|
| macOS | ✅ Fully supported | Homebrew / npm / script |
| Linux | ✅ Fully supported | apt / npm / script |
| Windows | ✅ Fully supported | Chocolatey / Scoop / npm |
| WSL | ✅ Fully supported | Same as Linux |
| Docker | ⏳ Planned | Future versions |

## License

MIT License - see [LICENSE](LICENSE) file for details.