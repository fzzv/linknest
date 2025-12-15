# LinkNest Docker 一键部署

LinkNest 的 Docker 一键启动方案（MySQL + Redis + API + Web）

- `docker-compose.yml`：基础服务定义（默认按生产方式运行）
- `docker-compose.dev.yml`：开发模式覆盖（挂载代码、热更新）
- `docker-compose.prod.yml`：生产模式覆盖（主要是 `restart` 策略等）

> 项目名（compose name）：`linknest`
>
> API 容器/镜像：`linknest-server`
>
> Web 容器/镜像：`linknest-web`

## 1 配置

1. 在 `docker/` 目录下创建配置文件：
   - 复制 `docker/.env.example` 为 `docker/.env`
2. 按需修改 `docker/.env`（数据库密码、端口映射、JWT/SMTP 等）

说明：
- MySQL/Redis 在容器内使用默认端口（3306/6379），对宿主机映射端口由 `*_EXPOSE_PORT` 控制。
- API 会自动注入 `DATABASE_URL` 指向容器内的 `mysql` 服务。

## 2 启动

在项目根目录执行（推荐）：

### 开发环境（dev）

```bash
docker compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up -d --build
```

特点：
- 挂载源码并启用热更新
- 使用 volume 隔离各目录的 `node_modules` 与 `packages/db/generated`，避免 Windows 生成物覆盖 Linux 容器环境

### 生产环境（pro）

```bash
docker compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml up -d --build
```

特点：
- 以生产方式启动，并启用 `restart: unless-stopped`

## 3 访问

默认端口（可在 `docker/.env` 修改）：
- API：`http://localhost:3000`
- Web：`http://localhost:3001`
- MySQL：`localhost:3316`
- Redis：`localhost:6389`

## 4 Prisma 以及 windows 环境的问题

我是用的开发环境是windows，dev目前不支持热更新（暂时没找到解决办法）

Prisma: `packages/db/generated` 中的 Prisma Client 可能包含 Windows 二进制，Linux 容器内不可用。

因此 `linknest-server` 启动时会在容器内执行：
- `prisma generate`（重新生成 Prisma Client 到 `packages/db/generated/prisma`）
- `prisma migrate deploy`（应用 `packages/db/prisma/migrations`）

如需手动执行（示例为生产组合）：

```bash
docker compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml exec linknest-server sh -lc "cd /app/packages/db && node_modules/.bin/prisma migrate deploy --schema prisma/schema.prisma"
```

## 5 常用命令

查看日志：

```bash
docker compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml logs -f linknest-server
```

停止并移除容器（保留数据卷）：

```bash
docker compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml down
```

停止并移除容器 + 清理数据卷（会删除 MySQL/Redis 数据）：

```bash
docker compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml down -v
```

