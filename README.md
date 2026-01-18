# jni-bun-template

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```


## Visual Studio Code
- Install the Bun plugin from oven
- Install "Bun Scripts"
- F5 launch script is available including a debugger configuration


## Linting
- Linting is done via ES Lint run `bun run lint`

## Docker Setup

### Docker Compose
```shell
docker compose up --build -d
```

### Create a Multi Architecture Image for Self-Hosted Registry

Prep docker environment once to provide multi-arch builds:
```shell
docker buildx create --use --name multiarch
docker buildx inspect --bootstrap
```

Login your registry:
```shell
docker login registry.mopore.org
```

Create and push the image to registry
```shell
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t registry.mopore.org/jni/jni-bun-template:latest \
  --push \
  .
```
