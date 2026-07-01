# ===== 构建阶段：安装全部依赖 + 构建前端 =====
FROM node:20-slim AS builder
WORKDIR /app
RUN corepack enable
# better-sqlite3 原生模块编译工具（prebuilt 不可用时回退本地编译）
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# ===== 运行阶段：仅生产依赖 + 前端构建产物 =====
FROM node:20-slim AS runner
WORKDIR /app
RUN corepack enable
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package.json pnpm-lock.yaml ./
# 生产依赖（含 better-sqlite3）+ tsx（运行 TS 必需，tsx 在 devDependencies 故单独装）
RUN pnpm install --frozen-lockfile --prod && pnpm add tsx
COPY api ./api
COPY shared ./shared
COPY tsconfig.json ./
COPY --from=builder /app/dist ./dist
# 数据库持久化到 /data 卷（部署平台挂载持久卷到此路径，数据不丢失）
ENV DB_PATH=/data/data.db
ENV PORT=3001
ENV NODE_ENV=production
EXPOSE 3001
VOLUME ["/data"]
CMD ["npx", "tsx", "api/server.ts"]
