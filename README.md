# 俄罗斯方块 - 完整全栈版 (v4)

## 功能特性

- JWT 用户认证（注册/登录/登出）
- 完整俄罗斯方块游戏（7种方块、等级加速、分数计算）
- 全局排行榜（前10名），每5秒自动刷新
- 个人排名显示（当前排名/总人数/最高分）
- 每局游戏历史记录保存，图表展示最近10局分数趋势
- 深色/浅色主题切换
- Pinia 全局状态管理
- Axios 拦截器自动注入 JWT Token

## 项目结构

```
tetris_vue_django/
├── Dockerfile                  # Docker 构建文件
├── docker-compose.yml          # Docker Compose 配置
├── API_DOCS.md                 # API 文档
├── README.md                   # 本文件
├── backend/                    # Django 后端
│   ├── manage.py               # Django 管理命令
│   ├── requirements.txt        # Python 依赖
│   ├── tetris_backend/
│   │   ├── settings.py         # Django 配置（JWT, CORS, DRF）
│   │   ├── urls.py             # 主路由
│   │   └── wsgi.py             # WSGI 入口
│   └── game_api/
│       ├── models.py           # User(AbstractUser) + Score + GameHistory
│       ├── serializers.py      # DRF 序列化器
│       ├── views.py            # 认证 + 分数 API 视图
│       ├── urls.py             # API 路由
│       ├── apps.py             # App 配置
│       └── admin.py
└── frontend/                   # Vue 3 前端
    ├── index.html              # HTML 入口
    ├── package.json            # npm 依赖
    ├── vite.config.js          # Vite 构建配置
    └── src/
        ├── main.js             # Vue 入口
        ├── App.vue             # 根组件
        ├── stores/             # Pinia 状态管理
        │   ├── authStore.js    # 用户认证状态
        │   ├── gameStore.js    # 游戏状态
        │   └── leaderboardStore.js  # 排行榜 + 历史
        ├── composables/
        │   └── useTetris.js    # 核心游戏逻辑
        └── components/
            ├── GameCanvas.vue  # 游戏画布
            ├── NextPiece.vue   # 下一个方块预览
            ├── ScorePanel.vue  # 分数/等级/消行/耗时
            ├── Leaderboard.vue # 排行榜 + 个人排名
            ├── LoginModal.vue  # 登录/注册弹窗
            ├── Settings.vue    # 主题/音效设置
            └── GameHistory.vue # 历史战绩图表
```

## 开发环境启动

### 方式一：后端 + 前端分离启动（推荐）

```bash
# 终端1 - 启动后端
cd backend
pip install -r requirements.txt
python manage.py migrate --run-syncdb
python manage.py runserver

# 终端2 - 启动前端
cd frontend
npm install
npm run dev

# 访问 http://localhost:5173
```

### 方式二：纯后端运行（前端已构建后）

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate --run-syncdb

# 先构建前端
cd frontend
npm install && npm run build
cd ../backend

# 启动后端（会从 frontend/dist/ 加载静态文件）
python manage.py runserver

# 访问 http://localhost:8000
```

## Docker 部署

```bash
docker-compose up --build

# 访问 http://localhost:5173
```

## 游戏操作

| 按键 | 功能     |
| ---- | -------- |
| ← →  | 移动     |
| ↑    | 旋转     |
| 空格 | 直接落下 |
| P    | 暂停     |
| R    | 重新开始 |

## 功能说明

### 1. 用户认证
- 点击右上角"登录/注册"按钮
- 支持注册新账号和登录
- 登录后自动关联游戏分数

### 2. 游戏流程
- 登录（可选）后自动开始游戏
- 游戏结束时自动提交分数
- 排行榜每5秒自动刷新

### 3. 排行榜
- 显示全局前10名
- 登录后显示个人排名
- 最近10局历史战绩图表

### 4. 设置
- 深色/浅色主题切换
- 音效开关

## API 端点

详见 [API_DOCS.md](./API_DOCS.md)

## 注意事项

- 开发环境 secret key 为示例值，生产环境请修改
- 使用 SQLite 数据库，迁移方便
- JWT Token 有效期7天，Refresh Token 有效期30天
- 前端通过 Vite proxy 代理 /api 请求到后端
