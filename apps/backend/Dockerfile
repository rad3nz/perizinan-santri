FROM oven/bun:1 AS base
WORKDIR /app
# install with all workspace manifests so --frozen-lockfile resolves the graph
COPY package.json bun.lock tsconfig.base.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/frontend/package.json apps/frontend/
COPY packages/shared/package.json packages/shared/
RUN bun install --frozen-lockfile
# source
COPY packages/shared packages/shared
COPY apps/backend apps/backend
WORKDIR /app/apps/backend
# entrypoint runs migrations (+ optional seed) then starts the server
CMD ["sh", "-c", "bun run db:migrate && ([ \"$SEED_ON_START\" = \"true\" ] && bun run db:seed || true) && bun run start"]
