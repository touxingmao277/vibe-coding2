# 俄罗斯方块 API 文档

## 基础信息

- **Base URL**: `http://localhost:8000/api/` (后端) 或 `/api/` (前端 Vite proxy)
- **认证方式**: JWT Bearer Token
- **内容类型**: `application/json`

---

## 认证 API

### POST /api/register/
创建新用户账号。

**请求体**:
```json
{
  "username": "玩家名称",
  "password": "密码（至少4位）"
}
```

**响应** `201 Created`:
```json
{
  "user": { "id": 1, "username": "玩家名称", "date_joined": "2026-05-27T08:00:00Z" },
  "access": "eyJhbGciOiJI...",
  "refresh": "eyJhbGciOiJI..."
}
```

**错误** `400`:
```json
{ "username": ["已存在的用户名"] }
```

### POST /api/login/
用户登录，获取 JWT Token。

**请求体**:
```json
{
  "username": "玩家名称",
  "password": "密码"
}
```

**响应** `200`:
```json
{
  "user": { "id": 1, "username": "玩家名称", "date_joined": "2026-05-27T08:00:00Z" },
  "access": "eyJhbGciOiJI...",
  "refresh": "eyJhbGciOiJI..."
}
```

**错误** `401`:
```json
{ "error": "用户名或密码错误" }
```

### POST /api/logout/
登出（使 refresh token 失效）。

**请求头**: `Authorization: Bearer <access_token>`

**请求体**:
```json
{
  "refresh": "可选，要作废的 refresh token"
}
```

**响应** `200`:
```json
{ "status": "ok" }
```

### GET /api/profile/
获取当前登录用户信息。

**请求头**: `Authorization: Bearer <access_token>`

**响应** `200`:
```json
{
  "id": 1,
  "username": "玩家名称",
  "date_joined": "2026-05-27T08:00:00Z"
}
```

---

## 分数 API

### GET /api/scores/leaderboard/
获取全局排行榜（前10名）。

**无需认证**

**响应** `200`:
```json
{
  "scores": [
    {
      "id": 1,
      "player_name": "玩家A",
      "score": 1200,
      "level": 5,
      "lines": 48,
      "created_at": "2026-05-27T08:00:00"
    }
  ]
}
```

### POST /api/scores/submit/
提交游戏分数（需要认证）。

**请求头**: `Authorization: Bearer <access_token>`

**请求体**:
```json
{
  "score": 1200,
  "level": 5,
  "lines": 48,
  "duration_seconds": 185
}
```

**响应** `201 Created`:
```json
{
  "status": "ok",
  "score": {
    "id": 1,
    "player_name": "玩家名称",
    "score": 1200,
    "level": 5,
    "lines": 48,
    "created_at": "2026-05-27T08:00:00"
  }
}
```

### GET /api/scores/history/
获取当前用户的游戏历史记录。

**请求头**: `Authorization: Bearer <access_token>`

**查询参数** (可选): `limit` - 返回条数，默认10，最大50

**响应** `200`:
```json
{
  "history": [
    {
      "id": 1,
      "score": 1200,
      "level": 5,
      "lines": 48,
      "duration_seconds": 185,
      "created_at": "2026-05-27T08:00:00"
    }
  ]
}
```

### GET /api/scores/rank/
获取当前用户的排名信息。

**请求头**: `Authorization: Bearer <access_token>`

**响应** `200`:
```json
{
  "rank": 3,
  "best_score": 1200,
  "total_players": 15
}
```

**说明**:
- `rank`: 当前用户在所有玩家中的排名（1-based），无记录时为 `null`
- `best_score`: 当前用户的最高分
- `total_players`: 有分数记录的玩家总数

---

## 错误码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 认证失败（token 无效或过期） |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 使用示例

### cURL

```bash
# 注册
curl -X POST http://localhost:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"1234"}'

# 登录
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"1234"}'

# 提交分数（将 TOKEN 替换为实际的 access token）
curl -X POST http://localhost:8000/api/scores/submit/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"score":800,"level":3,"lines":25,"duration_seconds":120}'

# 获取排行榜
curl http://localhost:8000/api/scores/leaderboard/

# 获取个人历史
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8000/api/scores/history/

# 获取个人排名
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8000/api/scores/rank/
```

### Python

```python
import requests

BASE = "http://localhost:8000/api"

# 注册
resp = requests.post(f"{BASE}/register/", json={
    "username": "玩家名称",
    "password": "密码"
})
token = resp.json()["access"]

# 提交分数
resp = requests.post(f"{BASE}/scores/submit/", 
    json={"score": 800, "level": 3, "lines": 25, "duration_seconds": 120},
    headers={"Authorization": f"Bearer {token}"}
)

# 获取排行榜
resp = requests.get(f"{BASE}/scores/leaderboard/")
print(resp.json())
```

---

## 认证流程

```
┌─────────┐          ┌──────────────┐          ┌──────────┐
│ 前端     │  POST    │  /api/login/  │  JWT     │ 前端     │
│ (未登录) │ ────────→│  或 register │ ───────→ │ (已登录) │
│         │          │              │  Token   │          │
│         │          │              │          │          │
│         │          │              │          │ 游戏结束 │
│         │          │              │          │    ↓     │
│         │          │              │          │ POST     │
│         │          │              │          │ /api/    │
│         │          │              │          │ scores/  │
│         │          │              │          │ submit/  │
└─────────┘          └──────────────┘          └──────────┘
  Token 存储在           ↓                       Authorization:
  localStorage     Authorization: Bearer <JWT>   Bearer <JWT>
```

Token 自动通过 Axios 拦截器添加到所有请求头中，无需手动处理。