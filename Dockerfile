# ===== 构建阶段：安装全部依赖 + 构建前端 =====
FROM node:20-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ===== 运行阶段：仅生产依赖 + 前端构建产物 =====
FROM node:20-slim AS runner
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm install tsx
COPY api ./api
COPY shared ./shared
COPY tsconfig.json ./
COPY --from=builder /app/dist ./dist
ENV DB_PATH=/data/data.db
ENV PORT=3001
ENV NODE_ENV=production
EXPOSE 3001
CMD ["npx", "tsx", "api/server.ts"]
