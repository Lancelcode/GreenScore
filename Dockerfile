# GreenScore — Next.js (Node.js 22) production image
#
# Three stages keep the final image small: dependencies are installed once,
# the app is built with them, and only Next.js's self-contained "standalone"
# server plus static files are copied into the runtime image.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:22-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Run as the unprivileged "node" user that ships with the image.
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
# The admin tool (scripts/create-admin.mts) and the rules it shares with the app.
COPY --from=build --chown=node:node /app/scripts/create-admin.mts ./scripts/create-admin.mts
COPY --from=build --chown=node:node /app/src/lib/validator.ts ./src/lib/validator.ts
USER node

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget -qO- http://127.0.0.1:3000/health || exit 1

CMD ["node", "server.js"]
