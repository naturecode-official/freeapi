# 分离配置管理指南

## 概述
本项目维护两个独立的 package.json 配置，分别用于不同的发布目标：

### 1. npm 配置 (`package.npm.json`)
- **包名**: `@cuijy/free-api`
- **版本**: `0.1.1` (已发布)
- **用途**: 发布到 npm 注册表
- **CLI 命令**: `free-api`
- **仓库**: 指向 `cuijy/free-api` (GitHub)

### 2. GitHub 配置 (`package.github.json`)  
- **包名**: `freeapi`
- **版本**: `0.2.0`
- **用途**: GitHub 仓库开发版本
- **CLI 命令**: `freeapi`
- **仓库**: 指向 `naturecode-official/freeapi` (GitHub)

## 使用方法

### 切换配置
```bash
# 切换到 npm 配置
./switch-config.sh npm

# 切换到 GitHub 配置  
./switch-config.sh github
```

### 发布到 npm
```bash
# 自动切换到 npm 配置并发布
./publish.sh npm

# 验证发布
curl -s "https://registry.npmjs.org/@cuijy/free-api/latest" | grep -o '"version":"[^"]*"'
```

### 开发（使用 GitHub 配置）
```bash
# 切换到 GitHub 配置
./switch-config.sh github

# 安装依赖
npm install

# 开发构建
npm run build

# 运行测试
npm test
```

## 文件说明

| 文件 | 用途 |
|------|------|
| `package.npm.json` | npm 发布配置 |
| `package.github.json` | GitHub 开发配置 |
| `switch-config.sh` | 配置切换脚本 |
| `publish.sh` | 发布脚本 |
| `package.json` | 当前活动配置（由脚本管理） |

## 工作流程

### 开发新功能
1. 使用 GitHub 配置开发：`./switch-config.sh github`
2. 编写代码和测试
3. 提交到 GitHub：`git add . && git commit && git push`

### 发布到 npm
1. 更新版本号（在 package.npm.json 中）
2. 发布：`./publish.sh npm`
3. 验证：`npm install -g @cuijy/free-api`

### 同步配置
如果需要将 GitHub 的更改同步到 npm 配置：
```bash
# 1. 确保在 GitHub 配置
./switch-config.sh github

# 2. 复制配置到 npm（除了名称和版本）
node -e "
  const gh = require('./package.github.json');
  const npm = require('./package.npm.json');
  
  // 保留 npm 的名称和版本
  const merged = {
    ...gh,
    name: npm.name,
    version: npm.version,
    repository: npm.repository,
    bugs: npm.bugs,
    homepage: npm.homepage
  };
  
  require('fs').writeFileSync(
    'package.npm.json', 
    JSON.stringify(merged, null, 2)
  );
  console.log('✅ 配置已同步');
"
```

## 注意事项
1. **不要手动编辑 package.json** - 使用切换脚本
2. **发布前测试** - 确保两个配置都能正常构建
3. **版本管理** - 分别管理两个配置的版本号
4. **Git 忽略** - `.gitignore` 已配置忽略临时文件

## 故障排除

### 配置切换失败
```bash
# 手动恢复
cp package.github.json package.json  # 或 package.npm.json
```

### 构建错误
```bash
# 清理并重新安装
rm -rf node_modules dist
npm install
npm run build
```

### 发布权限问题
确保有正确的 npm 令牌：
```bash
echo "//registry.npmjs.org/:_authToken=YOUR_TOKEN" > ~/.npmrc

# 测试令牌
npm whoami

# 测试发布权限
curl -s -H "Authorization: Bearer $(grep -o 'npm_[^"]*' ~/.npmrc)" \
  "https://registry.npmjs.org/-/whoami"
```