# FreeAPI

Simple CLI tool to access free AI chat services.

## Installation

```bash
# Download and install
curl -s https://raw.githubusercontent.com/naturecode-official/freeapi/main/install.sh | bash

# Or manually:
curl -O https://raw.githubusercontent.com/naturecode-official/freeapi/main/index.js
chmod +x index.js
sudo mv index.js /usr/local/bin/freeapi
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
