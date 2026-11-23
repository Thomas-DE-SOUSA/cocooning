# Next.js PWA of the couple (apps/couple/web). Build context: the repository root.
# Bump NODE_VERSION with engines.node of package.json, TURBO_VERSION with the tooling catalog.
ARG NODE_VERSION=22.23.5

FROM node:${NODE_VERSION}-bookworm-slim AS base
WORKDIR /app
ENV TZ=UTC \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    NEXT_TELEMETRY_DISABLED=1
RUN corepack enable

FROM base AS source
ARG TURBO_VERSION=2.11.13
COPY . .
RUN pnpm dlx turbo@${TURBO_VERSION} prune couple-web --docker

FROM base AS installer
COPY --from=source /app/out/json/ .
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY --from=source /app/out/full/ .
RUN pnpm turbo run build --filter=couple-web

FROM installer AS pruned
RUN pnpm prune --prod --ignore-scripts

FROM base AS runner
ENV NODE_ENV=production
COPY --from=pruned /app /app
USER node
WORKDIR /app/apps/couple/web
CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "3200"]
