# FreeAPI 安装指南

## 开发环境安装

### 1. 克隆项目
```bash
git clone https://github.com/yourusername/freeapi.git
cd freeapi
```

### 2. 安装依赖
```bash
# 安装 Node.js 依赖
npm install

# 安装 TypeScript 全局工具（如果需要）
npm install -g typescript ts-node
```

### 3. 构建项目
```bash
npm run build
```

### 4. 链接到全局
```bash
npm link
```

### 5. 测试安装
```bash
freeapi --help
```

## 用户安装（计划中）

### npm 安装（发布后）
```bash
npm install -g freeapi
```

### 一键安装脚本
```bash
curl -fsSL https://install.freeapi.dev | bash
```

### 平台特定安装

#### macOS (Homebrew)
```bash
brew install freeapi
```

#### Linux (APT)
```bash
# 添加仓库后
sudo apt-get update
sudo apt-get install freeapi
```

#### Windows
```powershell
# Chocolatey
choco install freeapi

# Scoop
scoop bucket add freeapi https://github.com/yourusername/freeapi-scoop
scoop install freeapi
```

## 快速开始

### 1. 初始化配置
```bash
freeapi init
```

### 2. 配置服务
```bash
freeapi config chatgpt_web
freeapi config deepseek
```

### 3. 启动服务
```bash
freeapi start chatgpt_web
```

### 4. 开始聊天
```bash
freeapi chat chatgpt_web
```

## 开发说明

### 项目结构
```
freeapi/
├── bin/              # CLI 可执行文件
├── src/              # 源代码
│   ├── cli/         # 命令行界面
│   ├── core/        # 核心框架
│   ├── services/    # 服务适配器
│   ├── browser/     # 浏览器自动化
│   └── api/         # 内部API
├── configs/         # 默认配置
├── tests/           # 测试文件
└── docs/            # 文档
```

### 开发命令
```bash
# 开发模式（自动编译）
npm run dev

# 运行测试
npm test

# 代码检查
npm run lint

# 代码格式化
npm run format

# 类型检查
npm run typecheck
```

### 添加新服务
1. 在 `src/services/` 创建新目录
2. 实现服务适配器接口
3. 添加配置模板
4. 更新服务注册
5. 添加测试

## 故障排除

### 常见问题

#### 1. 命令找不到
```bash
# 确保已链接
npm link

# 或使用本地运行
node bin/freeapi --help
```

#### 2. 依赖安装失败
```bash
# 清理并重新安装
rm -rf node_modules package-lock.json
npm install
```

#### 3. TypeScript 编译错误
```bash
# 检查 TypeScript 配置
npx tsc --noEmit

# 或重新安装 TypeScript
npm install typescript --save-dev
```

### 获取帮助
- 查看文档: `docs/` 目录
- 报告问题: GitHub Issues
- 讨论: GitHub Discussions

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送分支
5. 创建 Pull Request

## 许可证
MIT License