# LinkNest

[English README](./README.md)

LinkNest 是一个链接聚合平台，采用 Turborepo Monorepo 结构（Web + API + DB）。

## 预览

![Preview](docs/preview.png)

## 特性（技术栈）

- **Web**：Next.js 15 + React 19，Tailwind CSS v4 + daisyUI，next-intl，Zod，Zustand
- **API**：NestJS，JWT 登录鉴权，Swagger 文档（`/docs`），文件上传，i18n
- **数据库**：Prisma + MySQL，Redis 支持
- **工程化**：pnpm workspace，Turborepo，Docker/Compose
- **书签导入**：支持 Chrome 导出的 HTML 书签、以及自定义 JSON 格式（见 `apps/api/README.md`）

## 安装方式

环境要求：

- Node.js `>=18`（推荐：Node 22+）
- pnpm（项目通过 Corepack 固定为 `pnpm@8.15.5`）

```bash
corepack enable
pnpm install
```

## 开发/本地运行

### 方式 A：Docker 一键启动（推荐）

```bash
cp docker/.env.example docker/.env
docker compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up -d --build
```

默认访问地址（可在 `docker/.env` 修改）：

- Web：`http://localhost:3001`
- API：`http://localhost:3000`（Swagger：`http://localhost:3000/docs`）

更多说明见：`docker/README.md`。

### 方式 B：本地启动（DB/Redis 用 Docker）

```bash
cp docker/.env.example docker/.env
docker compose -f docker/docker-compose.yml up -d mysql redis

cp apps/api/.env.example apps/api/.env
cp packages/db/.env.example packages/db/.env

pnpm -C packages/db exec prisma generate --schema prisma/schema.prisma --generator client
pnpm -C packages/db exec prisma migrate deploy --schema prisma/schema.prisma
pnpm --filter @linknest/db build
pnpm -C packages/db run seed:default-links
pnpm dev
```

## 许可证

MIT - 详见 `LICENSE`。
