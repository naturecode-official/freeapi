#!/bin/bash

# 发布脚本
# 用法: ./publish.sh [npm|github]

set -e

TARGET=${1:-"npm"}

echo "准备发布到 $TARGET..."

# 切换到对应配置
./switch-config.sh $TARGET

# 重新构建
echo "重新构建项目..."
npm run build

case $TARGET in
  "npm")
    echo "准备 npm 发布文件..."
    # 复制 npm 专用的 README
    cp README.npm.md README.md
    
    echo "发布到 npm (@cuijy/free-api)..."
    npm publish --access public
    
    # 恢复原来的 README
    cp README.github.md README.md 2>/dev/null || true
    
    echo "✅ 已发布到 npm: @cuijy/free-api"
    echo "📦 包地址: https://www.npmjs.com/package/@cuijy/free-api"
    ;;
  "github")
    echo "GitHub 版本不发布到 npm，仅用于开发"
    echo "版本: $(grep '"version"' package.json | head -1 | cut -d'"' -f4)"
    echo "名称: $(grep '"name"' package.json | head -1 | cut -d'"' -f4)"
    ;;
  *)
    echo "错误: 未知目标 '$TARGET'"
    echo "用法: $0 [npm|github]"
    exit 1
    ;;
esac