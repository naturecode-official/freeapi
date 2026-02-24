# FreeAPI

Simple and transparent CLI tool for AI chat services.

## 🚀 Quick Install

### One-line install (Recommended):
```bash
curl -s https://raw.githubusercontent.com/naturecode-official/freeapi/main/install-simple | bash
```

### Manual install:
```bash
# Download
curl -O https://raw.githubusercontent.com/naturecode-official/freeapi/main/index.js

# Make executable
chmod +x index.js

# Install globally (requires sudo)
sudo mv index.js /usr/local/bin/freeapi
```

### User directory install (no sudo needed):
```bash
mkdir -p ~/.local/bin
curl -s https://raw.githubusercontent.com/naturecode-official/freeapi/main/index.js -o ~/.local/bin/freeapi
chmod +x ~/.local/bin/freeapi
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc  # or ~/.bashrc
source ~/.zshrc
```

## 📖 Usage

```bash
# Show help
freeapi --help

# List available AI services
freeapi list

# Start interactive chat
freeapi chat

# Chat with specific service
freeapi chat --service chatgpt

# Send a single message
freeapi chat --message "Hello, how are you?"

# Check service status
freeapi status
```

## 🤖 Available Services

- **chatgpt** - OpenAI ChatGPT
- **deepseek** - DeepSeek AI  
- **claude** - Anthropic Claude

## 🎯 Features

- **Simple**: Single file, minimal dependencies
- **Transparent**: No hidden features or虚假功能
- **Easy to use**: Three simple commands
- **Cross-platform**: Works on macOS, Linux, and Windows (with Node.js)

## 🔧 Development

```bash
# Clone repository
git clone https://github.com/naturecode-official/freeapi.git
cd freeapi

# Install dependencies
npm install

# Run locally
node index.js --help

# Test installation
./install-simple
```

## 📁 Project Structure

```
freeapi/
├── index.js          # Main application (single file)
├── package.json      # Dependencies
├── README.md         # This file
├── install-simple    # One-line installer
├── install.sh        # Alternative installer
├── LICENSE           # MIT License
└── .gitignore        # Git ignore rules
```

## ⚠️ Notes

This is a **simple demo version**. The current implementation shows the basic structure and interaction pattern. To add real AI API functionality:

1. Get API keys from respective services
2. Implement actual API calls in `index.js`
3. Add authentication and error handling

## 🤝 Contributing

Contributions are welcome! Since this is a simple project:

1. Fork the repository
2. Make your changes
3. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- **GitHub**: https://github.com/naturecode-official/freeapi
- **Issues**: https://github.com/naturecode-official/freeapi/issues
- **Install**: `curl -s https://raw.githubusercontent.com/naturecode-official/freeapi/main/install-simple | bash`

---

**FreeAPI** - Keep it simple, keep it transparent. 🎯