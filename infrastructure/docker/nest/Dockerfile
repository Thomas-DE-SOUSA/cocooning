# NestJS API of the couple. Build context: the repository root.
#   runner:      the API (apps/couple/api)
#   runner-init: applies the Prisma migrations once, then exits
# Bump NODE_VERSION with engines.node of package.json, TURBO_VERSION with the tooling catalog.
ARG NODE_VERSION=22.23.5

FROM node:${NODE_VERSION}-bookworm-slim AS base
WORKDIR /app
ENV TZ=UTC \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

FROM base AS source
ARG TURBO_VERSION=2.11.13
COPY . .
RUN pnpm dlx turbo@${TURBO_VERSION} prune couple-api --docker

FROM base AS installer
COPY --from=source /app/out/json/ .
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY --from=source /app/out/full/ .
RUN pnpm turbo run build --filter=couple-api

FROM installer AS pruned
RUN pnpm prune --prod --ignore-scripts

FROM base AS runner
ENV NODE_ENV=production
COPY --from=pruned /app /app
# Owned by node before the files volume mounts here: Docker copies this ownership into a new named volume.
RUN mkdir -p /data/files && chown node:node /data/files
USER node
WORKDIR /app/apps/couple/api
CMD ["node", "dist/main.js"]

FROM installer AS runner-init
# The Prisma schema engine needs OpenSSL, and is downloaded here because
# allowBuilds skips its install script.
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app/packages/couple/prisma
RUN pnpm exec prisma version
USER node
CMD ["pnpm", "exec", "prisma", "migrate", "deploy"]
