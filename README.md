# FreeAPI

Simple CLI tool to access free AI chat services.

## Installation

### Simple Method (Recommended):
```bash
curl -O https://raw.githubusercontent.com/naturecode-official/freeapi/main/index.js
chmod +x index.js
sudo mv index.js /usr/local/bin/freeapi
```

### Alternative Method:
```bash
# Download and run directly
curl -s https://raw.githubusercontent.com/naturecode-official/freeapi/main/index.js -o freeapi.js
chmod +x freeapi.js
./freeapi.js --help

# Or install to your local bin
mkdir -p ~/.local/bin
mv freeapi.js ~/.local/bin/freeapi
export PATH="$HOME/.local/bin:$PATH"
```

## Usage

```bash
# Show help
freeapi --help

# List available services
freeapi list

# Start interactive chat
freeapi chat

# Chat with specific service
freeapi chat --service chatgpt

# Send single message
freeapi chat --message "Hello"

# Check status
freeapi status
```

## Available Services

- **chatgpt**: OpenAI ChatGPT
- **deepseek**: DeepSeek AI  
- **claude**: Anthropic Claude

## Notes

This is a simple demo version. Real implementation would connect to actual AI APIs.

## License

MIT
