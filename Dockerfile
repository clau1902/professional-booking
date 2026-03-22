# ─── Stage 1: Install dependencies ───────────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ─── Stage 2: Build the app ───────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# These are only needed at build time for Next.js to compile
# Runtime secrets are injected via environment variables at container start
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Provide placeholder values so the build doesn't throw on missing env checks.
# Real values are injected at runtime.
ENV DATABASE_URL=postgresql://placeholder:placeholder@placeholder:5432/placeholder
ENV BETTER_AUTH_SECRET=placeholder
ENV BETTER_AUTH_URL=http://localhost:3000
ENV NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV STRIPE_SECRET_KEY=sk_test_placeholder
ENV STRIPE_WEBHOOK_SECRET=whsec_placeholder
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder

RUN npm run build

# ─── Stage 3: Production runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache wget
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only the standalone output and static assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
