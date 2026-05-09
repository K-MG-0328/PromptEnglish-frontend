# PromptEnglish Frontend — Next.js 16 multistage Dockerfile (standalone)
#
# Stage 1 (deps): node_modules
# Stage 2 (builder): Next 빌드 (standalone output 가정)
# Stage 3 (runner): standalone 산출물만 복사 → 슬림 런타임
#
# 주의: next.config.ts에 `output: "standalone"` 필요.
#
# 빌드: docker build --build-arg NEXT_PUBLIC_API_BASE_URL=... -t promptenglish-frontend .
# 실행: docker run -p 3003:3003 promptenglish-frontend

# ---- Stage 1: deps ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --loglevel=error

# ---- Stage 2: builder ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* 는 빌드 타임에 인라인. 런타임 변경 불가.
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:8003/api/v1
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

RUN npm run build

# ---- Stage 3: runner ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3003 \
    HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3003

CMD ["node", "server.js"]
