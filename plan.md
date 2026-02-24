# FreeAPI 项目计划

## 项目概述
FreeAPI 是一个工具，用于在后台运行多个AI网页版免费对话服务，为用户提供一个统一的接口来访问这些服务。

## 核心目标
1. 集成多个AI网页版免费对话服务（如ChatGPT网页版、DeepSeek、文心一言、通义千问等）
2. 提供统一的API接口供用户调用
3. 在后台自动管理会话、保持连接
4. 处理不同AI服务的差异（登录方式、API限制、会话管理等）

## 技术架构考虑

### 前端层
- Web界面或命令行界面
- 统一的聊天界面
- 服务选择和切换功能

### 后端层
- 服务代理层：处理不同AI服务的API调用
- 会话管理：维护与各个AI服务的会话状态
- 队列管理：处理并发请求和限流
- 数据持久化：保存聊天历史、配置等

### 集成服务
1. **ChatGPT网页版**：可能需要处理登录状态、会话token
2. **DeepSeek**：可能有免费API或网页版
3. **文心一言**：百度AI服务
4. **通义千问**：阿里云AI服务
5. **智谱清言**：清华系AI服务
6. **其他免费AI服务**

## 实现方案

### 方案一：浏览器自动化
- 使用Puppeteer/Playwright控制浏览器
- 模拟用户操作访问各个AI网站
- 优点：可以访问任何网页版服务
- 缺点：资源消耗大，稳定性依赖网站结构

### 方案二：API代理
- 分析各服务的API接口
- 直接调用后端API
- 优点：效率高，资源消耗小
- 缺点：需要逆向工程，可能违反服务条款

### 方案三：混合方案
- 对提供开放API的服务使用API调用
- 对只有网页版的服务使用浏览器自动化
- 根据服务特点选择最佳方案

## 技术栈建议
- **后端**：Node.js/Python（FastAPI/Flask）
- **浏览器自动化**：Puppeteer（Node.js）或Playwright（Python）
- **API管理**：Axios/Requests
- **会话管理**：Redis/MongoDB
- **队列系统**：Bull/Redis Queue
- **配置管理**：环境变量 + 配置文件

## 开发阶段

### 第一阶段：基础框架
1. 项目结构搭建
2. 配置管理系统
3. 日志和错误处理
4. 基础API设计

### 第二阶段：服务集成
1. 集成1-2个核心AI服务
2. 实现统一的聊天接口
3. 会话管理功能
4. 基础的前端界面

### 第三阶段：功能完善
1. 集成更多AI服务
2. 高级功能（文件上传、多模态等）
3. 性能优化
4. 监控和告警

### 第四阶段：生产部署
1. 容器化部署
2. 负载均衡
3. 安全加固
4. 文档完善

## 挑战与解决方案

### 技术挑战
1. **反爬虫机制**：使用轮换IP、模拟人类行为、处理验证码
2. **API变化**：设计可扩展的适配器模式
3. **会话保持**：实现自动重连和会话恢复
4. **性能优化**：并发控制、缓存策略

### 法律与合规
1. **服务条款**：确保使用方式符合各AI服务的条款
2. **数据隐私**：用户数据加密存储和传输
3. **使用限制**：遵守各服务的频率限制

## 详细实施方案

### 产品定位
- **名称**: FreeAPI
- **类型**: 跨平台终端应用 (CLI)
- **目标平台**: Windows, macOS, Linux
- **部署方式**: GitHub发布，支持包管理器安装
- **用户交互**: 命令行界面，支持交互式配置

### 核心功能设计

#### 1. 安装与初始化
```bash
# 安装方式
npm install -g freeapi  # Node.js版本
# 或
pip install freeapi     # Python版本
# 或
brew install freeapi    # macOS Homebrew
# 或
curl -fsSL https://install.freeapi.dev | bash  # 一键安装脚本

# 初始化配置
freeapi init
```

#### 2. 主命令结构
```bash
# 查看可用配置
freeapi

# 查看所有可用服务
freeapi list

# 配置特定服务
freeapi config <service_name>

# 启动服务
freeapi start <service_name>

# 交互式聊天
freeapi chat <service_name>

# 查看状态
freeapi status

# 查看日志
freeapi logs

# 停止服务
freeapi stop
```

#### 3. 配置管理
- **全局配置文件**: `~/.freeapi/config.yaml`
- **服务配置文件**: `~/.freeapi/services/<service_name>.yaml`
- **会话存储**: `~/.freeapi/sessions/`
- **日志文件**: `~/.freeapi/logs/`

#### 4. 服务适配器架构
```
Service Adapter Interface
├── ChatGPT Web Adapter
│   ├── 浏览器自动化 (Puppeteer/Playwright)
│   ├── 会话保持
│   └── 消息队列
├── DeepSeek Adapter
│   ├── API调用
│   ├── Token管理
│   └── 频率限制
├── 文心一言 Adapter
│   ├── 百度账号登录
│   ├── API代理
│   └── 会话管理
└── 通义千问 Adapter
    ├── 阿里云API
    ├── 免费额度管理
    └── 错误重试
```

### 技术栈选择

#### 方案：Node.js + TypeScript
**优点**：
1. 跨平台支持完善
2. Puppeteer对浏览器自动化支持好
3. npm包管理方便分发
4. 社区生态丰富

**核心依赖**：
```json
{
  "dependencies": {
    "commander": "命令行解析",
    "inquirer": "交互式提示",
    "chalk": "终端颜色",
    "ora": "加载动画",
    "puppeteer": "浏览器自动化",
    "playwright": "备用浏览器控制",
    "axios": "HTTP请求",
    "yaml": "配置文件解析",
    "winston": "日志管理",
    "conf": "配置存储"
  }
}
```

#### 备选方案：Python
**优点**：
1. Playwright支持好
2. 异步处理能力强
3. 机器学习生态丰富

### 项目结构
```
freeapi/
├── bin/
│   └── freeapi          # 可执行入口
├── src/
│   ├── cli/            # 命令行界面
│   │   ├── commands/   # 命令实现
│   │   └── prompts/    # 交互式提示
│   ├── core/           # 核心框架
│   │   ├── config/     # 配置管理
│   │   ├── logger/     # 日志系统
│   │   └── utils/      # 工具函数
│   ├── services/       # 服务适配器
│   │   ├── base/       # 基础适配器接口
│   │   ├── chatgpt/    # ChatGPT实现
│   │   ├── deepseek/   # DeepSeek实现
│   │   ├── wenxin/     # 文心一言实现
│   │   └── qwen/       # 通义千问实现
│   ├── browser/        # 浏览器自动化层
│   │   ├── manager/    # 浏览器管理
│   │   ├── sessions/   # 会话管理
│   │   └── utils/      # 浏览器工具
│   └── api/           # 内部API层
│       ├── server/     # HTTP服务器
│       └── client/     # API客户端
├── configs/           # 默认配置
├── scripts/          # 构建脚本
├── tests/            # 测试
├── docs/             # 文档
└── examples/         # 示例
```

### 开发路线图

#### Phase 1: 基础框架 (1-2周)
1. **项目初始化**
   - 创建package.json和基础配置
   - 设置TypeScript编译环境
   - 配置ESLint和Prettier

2. **CLI框架搭建**
   - 实现基础命令结构
   - 添加交互式提示
   - 创建配置管理系统

3. **日志和错误处理**
   - 实现分级日志系统
   - 添加全局错误处理
   - 创建调试工具

#### Phase 2: 核心功能 (2-3周)
1. **浏览器自动化层**
   - 实现浏览器管理器
   - 添加会话保持功能
   - 实现页面监控和恢复

2. **服务适配器接口**
   - 定义统一适配器接口
   - 实现基础适配器类
   - 添加服务注册机制

3. **第一个服务集成** (ChatGPT Web)
   - 分析ChatGPT网页版结构
   - 实现登录和会话管理
   - 添加消息发送和接收

#### Phase 3: 功能完善 (2-3周)
1. **更多服务集成**
   - DeepSeek API集成
   - 文心一言集成
   - 通义千问集成

2. **高级功能**
   - 并发请求处理
   - 服务健康检查
   - 自动故障转移

3. **用户体验优化**
   - 进度显示和动画
   - 命令自动补全
   - 配置文件验证

#### Phase 4: 发布准备 (1周)
1. **打包和分发**
   - 创建安装脚本
   - 配置npm发布
   - 准备Homebrew formula

2. **文档完善**
   - 编写用户指南
   - 创建API文档
   - 添加示例代码

3. **测试和验证**
   - 跨平台测试
   - 性能测试
   - 稳定性测试

### 跨平台考虑

#### Windows支持
1. **安装方式**: Chocolatey, Scoop, 独立安装包
2. **路径处理**: 统一使用path模块处理路径分隔符
3. **权限管理**: 处理Windows用户权限问题

#### macOS支持
1. **安装方式**: Homebrew, 独立dmg安装包
2. **权限提示**: 处理macOS安全权限
3. **浏览器路径**: 自动检测系统浏览器

#### Linux支持
1. **安装方式**: apt, yum, snap, AppImage
2. **依赖管理**: 自动安装系统依赖
3. **服务管理**: 支持systemd服务集成

### 配置示例

#### 全局配置 (~/.freeapi/config.yaml)
```yaml
version: "1.0"
log_level: "info"
log_file: "~/.freeapi/logs/freeapi.log"
data_dir: "~/.freeapi/data"
cache_dir: "~/.freeapi/cache"

services:
  enabled:
    - chatgpt_web
    - deepseek
    - wenxin
  default: "chatgpt_web"

browser:
  headless: true
  timeout: 30000
  user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
```

#### 服务配置 (~/.freeapi/services/chatgpt_web.yaml)
```yaml
name: "chatgpt_web"
type: "browser"
enabled: true

credentials:
  email: "user@example.com"
  password: "encrypted_password"

browser:
  executable_path: "auto"
  args:
    - "--no-sandbox"
    - "--disable-dev-shm-usage"

session:
  keep_alive: true
  refresh_interval: 3600
  max_retries: 3
```

### 进度跟踪

#### 当前进度
- [x] 项目初始化 (package.json, tsconfig, eslint, prettier, jest)
- [x] CLI框架搭建 (commander, inquirer, chalk, ora)
- [x] 配置管理系统 (JSON配置文件，交互式配置)
- [ ] 日志系统 (winston集成)
- [ ] 浏览器自动化层 (Puppeteer/Playwright)
- [ ] 服务适配器接口 (基础接口设计)
- [ ] ChatGPT Web集成
- [ ] DeepSeek集成
- [ ] 文心一言集成
- [ ] 通义千问集成
- [ ] 打包和分发
- [x] 基础文档完善 (README.md, AGENTS.md)

#### 已实现功能
1. **基础CLI框架**:
   - `freeapi` - 显示可用配置和命令
   - `freeapi init` - 初始化配置
   - `freeapi list` - 列出可用服务
   - `freeapi config <service>` - 配置特定服务
   - `freeapi start <service>` - 启动服务 (占位符)
   - `freeapi chat <service>` - 交互式聊天 (占位符)
   - `freeapi status` - 检查状态 (占位符)
   - `freeapi logs` - 查看日志 (占位符)
   - `freeapi stop` - 停止服务 (占位符)

2. **配置管理**:
   - 自动创建 `~/.freeapi/` 目录结构
   - JSON配置文件存储
   - 交互式服务配置向导
   - 支持ChatGPT Web和DeepSeek的特定配置

3. **项目结构**:
   - TypeScript项目配置
   - 模块化目录结构
   - 开发工具链 (ESLint, Prettier, Jest)

#### 下一步行动
1. 实现日志系统 (winston集成)
2. 设计服务适配器基础接口
3. 实现浏览器自动化管理器
4. 开始ChatGPT Web适配器开发
5. 添加服务状态管理
6. 实现真正的服务启动/停止逻辑

## 实施总结

### 已完成的工作 (Phase 1 基础框架)

#### 1. 项目初始化
- ✅ 创建了完整的项目结构
- ✅ 配置了TypeScript编译环境
- ✅ 设置了代码质量工具 (ESLint, Prettier, Jest)
- ✅ 定义了package.json和依赖管理

#### 2. CLI框架搭建
- ✅ 实现了完整的命令行界面
- ✅ 集成了commander进行命令解析
- ✅ 添加了交互式提示 (inquirer)
- ✅ 实现了终端美化 (chalk, ora)
- ✅ 创建了可执行入口文件

#### 3. 配置管理系统
- ✅ 设计了配置文件结构 (`~/.freeapi/`)
- ✅ 实现了JSON配置存储
- ✅ 创建了交互式配置向导
- ✅ 支持服务特定配置模板
- ✅ 实现了配置验证和默认值

#### 4. 命令实现
- ✅ `freeapi` - 显示主帮助信息
- ✅ `freeapi init` - 初始化配置
- ✅ `freeapi list` - 列出可用服务
- ✅ `freeapi config <service>` - 配置特定服务
- ✅ `freeapi start <service>` - 启动服务 (占位符)
- ✅ `freeapi chat <service>` - 交互聊天 (占位符)
- ✅ `freeapi status` - 检查状态 (占位符)
- ✅ `freeapi logs` - 查看日志 (占位符)
- ✅ `freeapi stop` - 停止服务 (占位符)

#### 5. 文档完善
- ✅ README.md - 项目说明文档
- ✅ AGENTS.md - 开发指南文档
- ✅ INSTALL.md - 安装指南
- ✅ plan.md - 项目计划和进度跟踪

### 技术架构实现

#### 项目结构
```
freeapi/
├── bin/freeapi                    # CLI入口
├── src/cli/                       # 命令行界面
│   ├── index.ts                  # 主CLI逻辑
│   └── commands/                 # 命令实现
│       ├── init.ts              # 初始化命令
│       ├── list.ts              # 列出服务
│       ├── config.ts            # 配置服务
│       ├── start.ts             # 启动服务
│       ├── chat.ts              # 交互聊天
│       ├── status.ts            # 状态检查
│       ├── logs.ts              # 日志查看
│       └── stop.ts              # 停止服务
├── src/core/                     # 核心框架 (待实现)
├── src/services/                 # 服务适配器 (待实现)
├── src/browser/                  # 浏览器自动化 (待实现)
└── src/api/                      # 内部API (待实现)
```

#### 配置结构
```
~/.freeapi/
├── config.json                  # 全局配置
├── services/                   # 服务配置
│   ├── chatgpt_web.json       # ChatGPT配置
│   ├── deepseek.json          # DeepSeek配置
│   └── wenxin.json            # 文心一言配置
├── sessions/                  # 会话数据
├── logs/                     # 日志文件
├── data/                     # 应用数据
└── cache/                    # 缓存文件
```

### 下一步开发重点 (Phase 2 核心功能)

#### 优先级 1: 服务适配器框架
1. **设计适配器接口** - 定义统一的服务接口
2. **实现基础适配器类** - 提供通用功能
3. **创建服务注册机制** - 动态加载服务

#### 优先级 2: 浏览器自动化
1. **浏览器管理器** - 管理Puppeteer/Playwright实例
2. **会话保持** - 实现自动重连和恢复
3. **页面监控** - 检测页面状态和错误

#### 优先级 3: ChatGPT Web集成
1. **登录流程** - 自动化ChatGPT登录
2. **消息处理** - 发送和接收消息
3. **会话管理** - 保持聊天会话

#### 优先级 4: 核心功能完善
1. **日志系统** - 集成winston日志
2. **状态管理** - 服务状态跟踪
3. **错误处理** - 完善的错误恢复

### 开发里程碑

#### 里程碑 1: 基础框架完成 (当前)
- ✅ 项目结构搭建
- ✅ CLI命令框架
- ✅ 配置管理系统
- ✅ 基础文档

#### 里程碑 2: 第一个服务集成 (目标: 1周)
- [ ] 服务适配器接口
- [ ] 浏览器自动化层
- [ ] ChatGPT Web基础功能
- [ ] 基本聊天界面

#### 里程碑 3: 多服务支持 (目标: 2周)
- [ ] DeepSeek API集成
- [ ] 文心一言集成
- [ ] 服务切换功能
- [ ] 性能优化

#### 里程碑 4: 生产就绪 (目标: 3周)
- [ ] 错误处理和恢复
- [ ] 性能监控
- [ ] 打包和分发
- [ ] 完整文档

## 更新日志

### 2025-02-24: 详细方案制定
- 明确了跨平台终端应用定位
- 设计了完整的CLI命令结构
- 选择了Node.js + TypeScript技术栈
- 制定了四阶段开发路线图
- 添加了配置示例和进度跟踪

### 2025-02-24: Phase 1 基础框架完成
- ✅ 创建了完整的项目结构
- ✅ 实现了所有CLI命令框架
- ✅ 完成了配置管理系统
- ✅ 编写了完整的项目文档
- ✅ 创建了演示和安装脚本