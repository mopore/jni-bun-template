# ------------------------------------------------------------------------
# BUILDER
# ------------------------------------------------------------------------
#
FROM oven/bun:1.3-debian AS builder

WORKDIR /app

# Create a minimal Bun project
COPY package.json bun.lock tsconfig.json eslint.config.js ./
COPY src ./src
COPY test-core ./test-core
RUN bun install --frozen-lockfile --no-progress

# Lint and run tests (exclude worker test - flaky under QEMU emulation)
RUN bun run lint
RUN LOG_SETUP=prod TZ=UTC bun --bun mocha 'test-core/**/*.spec.ts' --ignore 'test-core/useMultipleCores.spec.ts' --exit



# ------------------------------------------------------------------------
# RUNTIME
# ------------------------------------------------------------------------
#
FROM oven/bun:1.3-debian

# # Install project specifics 
# # Examples adds audio capabilities to runtime container
#
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

# # Prep special folders
# # Add folders the 'bun' user will not be able to create themself
#
# RUN mkdir -p /app/pollyCache \
#     && chown bun:bun /app/pollyCache

USER bun

ENTRYPOINT [ "bun", "run", "src/index.ts" ]

# Default args (none)
CMD []