```
     _ _   _ ___   ____              
    | | \ | |_ _| | __ ) _   _ _ __  
 _  | |  \| || |  |  _ \| | | | '_ \ 
| |_| | |\  || |  | |_) | |_| | | | |
 \___/|_| \_|___| |____/ \__,_|_| |_|
                                     
 _____                    _       _       
|_   _|__ _ __ ___  _ __ | | __ _| |_ ___ 
  | |/ _ \ '_ ` _ \| '_ \| |/ _` | __/ _ \
  | |  __/ | | | | | |_) | | (_| | ||  __/
  |_|\___|_| |_| |_| .__/|_|\__,_|\__\___|
                   |_|                    
```

# JNI Bun Template
This projects serves as a GitHub template project with Bun. It provides linting, tests, sample code
and Docker integration.

## Key Features & Architecture

This template is opinionated and enforces strict patterns for production readiness:

- **Strict TypeScript**: Configured with strict rules (e.g., `noUncheckedIndexedAccess`) to prevent runtime errors.
- **Error Handling**: Uses `Option<T>` (for nullables) and `Result<T,E>` (for operations) monads instead of `null` or `try/catch` blocks.
- **Logging**: Pre-configured Winston logger with environment-based formatting (`dev` vs `prod`).

## Usage

Install dependencies:
```shell
bun install
```

Prep a `.env` file in the project root:
```ini
TEST_VAR = "Test value"
TZ = "UTC"
```

Run:
```shell
LOG_SETUP=dev \
  bun run src/index.ts "test arg value from cli"
```

## Testing

### Unit Tests
Run core unit tests (Mocha + Chai) located in `test-core/`:
```shell
bun run test
```

### Integration Tests
Run integration tests (using Testcontainers) located in `test-integration/`:
```shell
bun run test:integration
```

## Linting
- Linting is done via ES Lint run `bun run lint`


## Creating an Executable Binary
Run these commands:
```shell
bun build src/index.ts \
  --compile --outfile jni-bun-template

chmod +x  ./jni-bun-template

LOG_SETUP=dev ./jni-bun-template "input from binary executable"
```
Note that this project depends on a `package.json` file in the same directory as the executable.


## Docker Setup

### Docker Compose
Build and run with docker compose setup (see docker-compose.yaml):
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

## Visual Studio Code Setup
When running with VSC:
- Install the Bun plugin from oven
- Install "Bun Scripts"
- F5 launch script is available including a debugger configuration

