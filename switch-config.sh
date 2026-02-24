#!/bin/bash

# 切换 package.json 配置脚本
# 用法: ./switch-config.sh [npm|github]

set -e

CONFIG=${1:-"npm"}

echo "切换到 $CONFIG 配置..."

case $CONFIG in
  "npm")
    echo "使用 npm 配置 (@cuijy/free-api)"
    cp package.npm.json package.json
    cp README.npm.md README.md 2>/dev/null || echo "注意: README.npm.md 不存在"
    ;;
  "github")
    echo "使用 GitHub 配置 (freeapi)"
    cp package.github.json package.json
    cp README.github.md README.md 2>/dev/null || echo "注意: README.github.md 不存在"
    ;;
  *)
    echo "错误: 未知配置 '$CONFIG'"
    echo "用法: $0 [npm|github]"
    exit 1
    ;;
esac

echo "✅ 已切换到 $CONFIG 配置"
echo "当前 package.json 名称: $(grep '"name"' package.json | head -1 | cut -d'"' -f4)"