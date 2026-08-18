# Podman Desktop Web Mode
# Build: podman build -t podman-desktop-web -f Containerfile.web .
# Run:   podman run -p 9000:9000 -v /run/podman/podman.sock:/run/podman/podman.sock podman-desktop-web

FROM node:24 AS build
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY .electron-vendors.cache.json ./
COPY packages/ packages/
COPY extensions/ extensions/
COPY types/ types/
COPY svelte.config.js tailwind.config.cjs tailwind-color-palette.json product.json recommendations.json featured.json telemetry.json ./

# Stub workspace members not needed for the build (satisfies lockfile resolution)
COPY storybook/package.json storybook/
COPY website/package.json website/
COPY website-argos/package.json website-argos/
COPY tests/playwright/package.json tests/playwright/

RUN corepack enable pnpm && pnpm install --no-frozen-lockfile

RUN pnpm --filter @podman-desktop/core-api build
RUN pnpm --filter @podman-desktop/ui-svelte build
RUN pnpm --filter renderer build
RUN pnpm --filter @podman-desktop/headless build

FROM node:24-slim
WORKDIR /app

RUN apt update && apt install podman ca-certificates -y && update-ca-certificates

COPY --from=build /app/extensions ./extensions
COPY --from=build /app/packages/headless/dist ./server
COPY --from=build /app/packages/renderer/dist ./static

# Install packages used via require() that can't be bundled into ESM
RUN npm install --no-save --ignore-scripts ssh2 tar-fs

RUN npm install tar-fs ws ssh2


ENV STATIC_DIR=/app/static
ENV PD_EXTENSIONS=/app/extensions
ENV PORT=9000
ENV PD_PODMAN_SOCKET_PATH=/run/podman/podman.sock
EXPOSE 9000

CMD ["node", "server/index.js"]
