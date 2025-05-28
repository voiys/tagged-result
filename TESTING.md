# Testing Guide

This project uses [Vitest](https://vitest.dev/) for testing.

## Available Test Scripts

- `npm test` - Run all tests once
- `npm run test:watch` - Run tests in watch mode (re-runs when files change)
- `npm run test:ui` - Open Vitest UI in browser for interactive testing
- `npm run test:coverage` - Run tests with coverage report

## Build Integration

Tests are automatically run as part of the build process. The build sequence is:
1. Clean previous build artifacts
2. Run linting with auto-fix
3. **Run all tests** (build fails if tests fail)
4. Generate TypeScript declarations
5. Build ESM output
6. Build CommonJS output

This ensures that all releases are fully tested and working correctly.

## Test Files

Test files are located in the `test/` directory and follow the pattern `*.test.ts`.

## Configuration

- Test configuration is in `vitest.config.ts`
- Coverage reports are generated in the `coverage/` directory
- Tests run in Node.js environment with TypeScript support

## Writing Tests

Example test structure:

```typescript
import { describe, test, expect } from 'vitest';
import { Result } from '../src/index';

describe('My Feature', () => {
  test('should work correctly', () => {
    const result = Result.ok({ message: 'success' });
    expect(result.type).toBe('success');
    expect(result.data.message).toBe('success');
  });
});
```
