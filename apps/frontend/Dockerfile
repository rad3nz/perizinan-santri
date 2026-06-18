FROM oven/bun:1 AS build
WORKDIR /app
# all workspace manifests so --frozen-lockfile resolves the graph
COPY package.json bun.lock tsconfig.base.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/frontend/package.json apps/frontend/
COPY packages/shared/package.json packages/shared/
RUN bun install --frozen-lockfile
# source — backend source is intentionally NOT copied; `import type { App }` is
# erased by esbuild at `vite build`, so only the workspace manifest above is needed.
COPY packages/shared packages/shared
COPY apps/frontend apps/frontend
ARG VITE_API_URL
ARG VITE_WS_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL
WORKDIR /app/apps/frontend
# Production build MUST be vite-only (no tsc). package.json "build": "vite build".
RUN bun run build

FROM nginx:alpine AS serve
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html
EXPOSE 80
