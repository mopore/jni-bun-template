# ------------------------------------------------------------------------
# BUILDER
# ------------------------------------------------------------------------
#
FROM oven/bun:1.3-debian AS builder

WORKDIR /app

# Create a minimal Bun project
COPY package.json bun.lock tsconfig.json eslint.config.js ./
COPY src ./src
RUN bun install --frozen-lockfile --no-progress

# Lint and run tests
RUN bun run lint

# ------------------------------------------------------------------------
# RUNTIME
# ------------------------------------------------------------------------
#
FROM oven/bun:1.3-debian

# Install project specifics
# RUN apt-get update \
#     && apt-get install -y --no-install-recommends \
#         ffmpeg \
#         alsa-utils \
#     && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy ONLY runtime dependencies
COPY package.json bun.lock ./
RUN bun install --production --frozen-lockfile --no-progress
COPY --from=builder /app/src ./src

# Prep special folders
# RUN mkdir -p /app/pollyCache \
#     && chown bun:bun /app/pollyCache

USER bun

CMD ["bun", "run", "src/index.ts"]
