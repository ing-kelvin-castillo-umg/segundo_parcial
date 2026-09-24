# Stage 1: Dependencies
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Deshabilitar telemetría de Next.js en build
ENV NEXT_TELEMETRY_DISABLED=1

# La URL del backend NO se inyecta en el build: el BFF la lee en tiempo de ejecución
# desde BACKEND_URL (variable solo de servidor definida en docker-compose.yml).

# Política de inactividad (no es información sensible, se incrusta en el bundle del cliente)
ARG NEXT_PUBLIC_IDLE_TIMEOUT_MS=120000
ARG NEXT_PUBLIC_IDLE_WARNING_MS=30000
ENV NEXT_PUBLIC_IDLE_TIMEOUT_MS=${NEXT_PUBLIC_IDLE_TIMEOUT_MS}
ENV NEXT_PUBLIC_IDLE_WARNING_MS=${NEXT_PUBLIC_IDLE_WARNING_MS}

RUN npm run build

# Stage 3: Runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos generados en standalone
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
