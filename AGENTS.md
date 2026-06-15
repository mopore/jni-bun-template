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
import { Option, none, some, optionalDefined, optionalCatch, optionalResolve } from "./shared/optional/optional";

const value = optionalDefined(maybeNull);      // Wraps nullable into Option<T>
const result = optionalCatch(() => riskyOp()); // Returns some(T) on success, none() on throw
const resolved = await optionalResolve(promise); // Returns some(T) on resolve, none() on reject

value.unwrapOr(defaultValue);                  // Safe default when none
value.unwrapExpect("error message");            // Throws with message if none
```

**Result<T,E> Pattern** (for operations that may fail):
```typescript
import { tryCatch, tryCatchAsync } from "./shared/trycatch/trycatch";

const { result, error } = tryCatch(() => riskyOperation());
if (error != null) {
    log.error(`Operation failed: ${error}`);
    // handle error
}
// result is narrowed to T

const { result, error } = await tryCatchAsync(asyncOperation());
```

#### Error Logging Pattern (try/catch breadcrumb)
When you *do* use a try/catch that rethrows, every catch block must do 3 things: (1) `log.error(msg)`
with context, (2) `log.trace()`, (3) `throw new Error(msg)` wrapping the original error. This builds
a breadcrumb trail from the error origin up to the entrypoint.

- Never use `process.exit()` in error handling - always throw so errors propagate.
- Error messages must include the current operation context + the original error.
- When dealing with domain data, include identifying fields (raw values, keys, identifiers).
- At the lowest error origin (e.g. `enums.ts`), also `log.error(msg)` + `log.trace()` before throwing.

```typescript
// Wrapping an operation with context
try {
    await riskyOperationAsync();
} catch (error) {
    const msg = `Reading config from disk failed: ${error}`;
    log.error(msg);
    log.trace();
    throw new Error(msg);
}

// With domain data context (include identifying fields)
try {
    logSetup = enums.to(LogSetup, rawLogSetup);
} catch (error) {
    const msg = `Failed to map LOG_SETUP (raw="${rawLogSetup}"): ${error}`;
    log.error(msg);
    log.trace();
    throw new Error(msg);
}
```

**Rules:**
- Never use `process.exit()` in error handling - always throw so errors propagate. In particular,
  never call it inside shared/library functions that can return `Option<T>` or `Result<T,E>`; let
  the caller decide how to handle failure.
- Use `log.error()` instead of `console.error()` for error messages.
- Use `log.trace()` instead of `console.trace()` for stack traces (both are available on the `ExtendedLogger`).
- Never silently swallow errors — always log or propagate them.
- In `catch` blocks, always narrow the error type before use; use `unknown` as the catch variable type.
- Choose the path that fits the failure: recoverable failures return `none()` /
  `{ result: null, error }`; rethrowing or unrecoverable failures apply the breadcrumb pattern above
  (`log.error` + `log.trace` + `throw new Error` wrapping the original).
- Reserve `throw` for rethrowing with context or truly unrecoverable states (e.g., programmer errors, invalid invariants).

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
