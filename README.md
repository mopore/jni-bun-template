# jni-bun-template

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

## Docker

### Docker Compose
```shell
docker compose up --build -d
```

### Multi Architecture

Prep docker environment once to provide multi-arch builds:
```shell
docker buildx create --use --name multiarch
docker buildx inspect --bootstrap
```

You will need to have a Container Registry

```shell
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t "jni-home/jni-bun-template:latest" \
  --push \
  .
```
