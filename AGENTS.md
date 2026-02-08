# Agent Instructions for jni-bun-template

## Project Overview
Bun TypeScript template with strict typing, ESLint, Mocha/Chai tests, Winston logging,
Docker support. Uses ESM modules exclusively.

## Tech Stack
- Runtime: **Bun 1.3+**
- Language: **TypeScript 5+** (strict mode, ESNext target)
- Module System: **ESM** (`"type": "module"`)
- Testing: **Mocha + Chai** (expect assertions)
- Linting: **ESLint v9** (flat config, @typescript-eslint)
- Logging: **Winston**
- Containers: **Testcontainers** (integration tests)

---

## Commands

### Install
```bash
bun install
```

### Run
```bash
bun run src/index.ts
```

### Lint
```bash
bun run lint
```

### Type Check
```bash
bun x tsc --noEmit
```

### Run Core Tests
```bash
bun run test
```

### Run Single Test File
```bash
bun --bun mocha test-core/optional.spec.ts
```

### Run Integration Tests
```bash
bun run test:integration
```

### Build Binary
```bash
bun build src/index.ts --compile --outfile <name>
```

### Docker
```bash
docker compose up --build -d
```

### Build & Push Multi-Arch Docker Image
```bash
bun run docker:build-push
```

---

## File Structure
```
src/
  index.ts                    # Entry point
  shared/
    helpers.ts                # CLI/env reading utilities
    SharedFunctions.ts        # Async utils (sleep, retry, concurrency)
    logger/log.ts             # Winston logger (dev/prod modes)
    enums/enums.ts            # Enum conversion utility
    optional/optional.ts      # Option<T> monad (Rust-style)
    trycatch/trycatch.ts      # Result<T,E> pattern
    workers/worker.ts         # Worker thread example

test-core/                    # Unit tests (*.spec.ts)
test-integration/             # Integration tests (testcontainers)
```

---

## Code Style

### Formatting
- **Tabs** for indentation (size 4) - see `.editorconfig`
- No trailing whitespace
- Final newline in files

### Imports
- No `.js` extension in relative imports (Bun handles resolution)
- Prefer named imports over default imports
```typescript
// Correct
import { log } from "./logger/log";
import { Option, none, some } from "./optional/optional";

// Wrong - don't add .js extension
import { log } from "./logger/log.js";
```

### Naming Conventions
- `camelCase`: functions, variables, parameters
- `PascalCase`: classes, types, interfaces, enums
- `SCREAMING_SNAKE_CASE`: constants, enum values (when string-based)
- Prefix unused params with `_`: `unwrapOr(_defaultValue: T)`

### Types
- Explicit return types on all functions (ESLint enforced)
- No `any` - use `unknown` and narrow with type guards
- No non-null assertions (`!`) - use Option pattern instead
- Prefer `type` over `interface` for object shapes
```typescript
// Correct
const sleepAsync = async (ms: number): Promise<void> => { ... }

// Wrong - missing return type
const sleepAsync = async (ms: number) => { ... }
```

### Error Handling
Use the provided patterns instead of raw try/catch:

**Option<T> Pattern** (for nullable values):
```typescript
import { Option, none, some, optionalDefined } from "./shared/optional/optional.js";

const value = optionalDefined(maybeNull);  // Wraps nullable
value.unwrapOr(defaultValue);              // Safe default
value.unwrapExpect("error message");       // Throws with message if none
```

**Result<T,E> Pattern** (for operations that may fail):
```typescript
import { tryCatch, tryCatchAsync } from "./shared/trycatch/trycatch.js";

const { result, error } = tryCatch(() => riskyOperation());
if (error != null) {
    // Handle error
}
// result is narrowed to T
```

### Async/Await
- Always use async/await, never raw Promises with `.then()`
- Always await promises (ESLint `no-floating-promises: error`)
- Use `sleepAsync()` from SharedFunctions for delays

### Boolean Expressions
Strict boolean checks enforced - no truthy/falsy:
```typescript
// Correct
if (value !== null && value !== undefined)
if (array.length > 0)
if (str !== "")

// Wrong - truthy/falsy not allowed
if (value)
if (array.length)
if (str)
```

---

## Testing

### Test File Naming
- `*.spec.ts` in `test-core/` or `test-integration/`

### Test Structure
```typescript
import { expect } from "chai";
import { myFunction } from "../src/path/to/module.js";

describe("module name", () => {
    it("does something specific", () => {
        // Arrange
        const input = "test";
        
        // Act
        const result = myFunction(input);
        
        // Assert
        expect(result).to.equal("expected");
    });
});
```

### Async Tests
```typescript
it("handles async operation", async () => {
    const result = await asyncFunction();
    expect(result).to.be.true;
});
```

---

## Environment Variables
- `LOG_SETUP`: `dev` or `prod` (required for logger)
- `TEST_VAR`: Example var loaded from `.env` file

Bun automatically loads `.env` files - no dotenv package needed.

Create `.env` in project root:
```ini
TEST_VAR = "Test value"
```

---

## ESLint Key Rules
| Rule | Level | Notes |
|------|-------|-------|
| `no-explicit-any` | error | Use `unknown` instead |
| `no-non-null-assertion` | error | Use Option pattern |
| `strict-boolean-expressions` | error | No truthy/falsy |
| `no-floating-promises` | error | Always await |
| `explicit-function-return-type` | warn | Add return types |
| `prefer-readonly` | warn | Mark immutable fields |

---

## Quick Reference

```bash
# Common workflow
bun install                                              # Install deps
bun run lint                                             # Check style
bun x tsc --noEmit                                       # Type check
bun run test                                             # Run core tests
bun run test:integration                                 # Run integration tests
bun --bun mocha test-core/x.spec.ts                       # Single test
bun run src/index.ts                                      # Run app
bun run docker:build-push                                # Build & push multi-arch image
```
