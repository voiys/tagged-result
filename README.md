# 🏷️ Tagged Result

[![npm version](https://badge.fury.io/js/%40voiys%2Ftagged-result.svg)](https://badge.fury.io/js/%40voiys%2Ftagged-result)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License: Unlicense](https://img.shields.io/badge/license-Unlicense-blue.svg)](http://unlicense.org/)

A lightweight TypeScript utility for creating tagged result unions with excellent type inference. Handle success/error outcomes with descriptive types that TypeScript can narrow automatically. 🚀

## ✨ Features

- 🧠 **Smart inference**: TypeScript automatically infers and narrows types
- 🏷️ **Flexible tags**: Supports both generic `success`/`error` and custom tagged variants
- 🪶 **Lightweight**: Zero dependencies, minimal footprint

## 📦 Installation

```bash
npm install @voiys/tagged-result
```

```bash
yarn add @voiys/tagged-result
```

```bash
pnpm add @voiys/tagged-result
```

```bash
bun add @voiys/tagged-result
```

## 🚀 Quick Start

```typescript
import { Result, ResultType } from '@voiys/tagged-result';

// Default success/error types
const success = Result.ok({ id: 123, name: "Alice" });
const error = Result.err({ message: "Something went wrong" });

// Custom tagged variants (must follow pattern)
const tagged = Result.ok("SUCCESS_USER_CREATED", { id: 123, name: "Alice" });
const failure = Result.err("ERROR_VALIDATION_FAILED", { field: "email" });

// TypeScript narrows automatically
if (tagged.type === "SUCCESS_USER_CREATED") {
  console.log(tagged.data.name); // TypeScript knows this is string
}
```

## 📋 API Reference

### `Result.ok(data)` & `Result.ok(type, data)`

Creates a successful result with optional custom type tag following the pattern `"SUCCESS"` or `"SUCCESS_${Uppercase<string>}"`.

```typescript
// Using default "SUCCESS" type
const result1 = Result.ok({ value: 42 });
// Type: ResultType<"SUCCESS", { value: number }>

// Using custom type (must follow SUCCESS pattern)
const result2 = Result.ok("SUCCESS_DATA_LOADED", { items: [] });
// Type: ResultType<"SUCCESS_DATA_LOADED", { items: any[] }>
```

### `Result.err(data)` & `Result.err(type, data)`

Creates an error result with optional custom type tag following the pattern `"ERROR"` or `"ERROR_${Uppercase<string>}"`.

```typescript
// Using default "ERROR" type
const result1 = Result.err({ message: "Something went wrong" });
// Type: ResultType<"ERROR", { message: string }>

// Using custom type (must follow ERROR pattern)
const result2 = Result.err("ERROR_NOT_FOUND", { resourceId: "user-123" });
// Type: ResultType<"ERROR_NOT_FOUND", { resourceId: string }>
```

### `ResultType<T, D>`

The core type representing a tagged result.

```typescript
type MyResult = ResultType<"SUCCESS" | "ERROR_FAILED", { message: string }>;
```

## 🔄 Synchronous Example

```typescript
import { Result, ResultType } from '@voiys/tagged-result';

// Let TypeScript infer the return type
function parseNumber(input: string) {
  const num = parseInt(input);
  if (isNaN(num)) {
    return Result.err("ERROR_INVALID_NUMBER", { input });
  }
  return Result.ok("SUCCESS_PARSED", { value: num });
}

// Or force a specific return type
function validateUser(data: any): ResultType<"SUCCESS_VALID", { id: number }> | ResultType<"ERROR_INVALID", { error: string }> {
  if (!data.id || typeof data.id !== 'number') {
    return Result.err("ERROR_INVALID", { error: "ID must be a number" });
  }
  return Result.ok("SUCCESS_VALID", { id: data.id });
}

// Usage
const result = parseNumber("42");
if (result.type === "SUCCESS_PARSED") {
  console.log(result.data.value); // TypeScript knows this is number
}
```

## ⚡ Asynchronous Example

```typescript
// Let TypeScript infer the return type
async function fetchData(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return Result.err("ERROR_HTTP", { status: response.status });
    }
    const data = await response.json();
    return Result.ok("SUCCESS", data);
  } catch (error) {
    return Result.err("ERROR_NETWORK", { message: error.message });
  }
}

// Or force a specific return type
async function getUser(id: number): Promise<ResultType<"SUCCESS_USER_FOUND", User> | ResultType<"ERROR_NOT_FOUND" | "ERROR", { message: string }>> {
  try {
    const response = await fetch(`/users/${id}`);
    if (response.status === 404) {
      return Result.err("ERROR_NOT_FOUND", { message: "User not found" });
    }
    if (!response.ok) {
      return Result.err("ERROR", { message: "Failed to fetch user" });
    }
    const user = await response.json();
    return Result.ok("SUCCESS_USER_FOUND", user);
  } catch (error) {
    return Result.err("ERROR", { message: error.message });
  }
}

// Usage
const userResult = await getUser(123);
switch (userResult.type) {
  case "SUCCESS_USER_FOUND":
    console.log('User:', userResult.data); // TypeScript knows this is User
    break;
  case "ERROR_NOT_FOUND":
  case "ERROR":
    console.error(userResult.data.message);
    break;
}
```

## 🎯 Best Practices

### 1. Use Descriptive Tags 🏷️

```typescript
// ❌ Not descriptive
Result.err("ERROR", { message: "Failed" });

// ✅ Descriptive and actionable (follows required pattern)
Result.err("ERROR_VALIDATION_FAILED", { field: "email", message: "Invalid email format" });
```

### 2. Group Related Result Types 📦

```typescript
type UserOperationResult = 
  | ResultType<"SUCCESS_USER_CREATED" | "SUCCESS_USER_UPDATED", User>
  | ResultType<"ERROR_USER_NOT_FOUND" | "ERROR_VALIDATION" | "ERROR_PERMISSION_DENIED", { message: string }>;
```

### 3. Use Switch Statements for Exhaustive Checking ✅

```typescript
function handleResult(result: UserOperationResult) {
  switch (result.type) {
    case "SUCCESS_USER_CREATED":
    case "SUCCESS_USER_UPDATED":
      return result.data; // TypeScript knows this is User
    case "ERROR_USER_NOT_FOUND":
    case "ERROR_VALIDATION":
    case "ERROR_PERMISSION_DENIED":
      throw new Error(result.data.message);
    default:
      // TypeScript will error if we miss a case
      const exhaustive: never = result;
      throw new Error('Unhandled result type');
  }
}
```

### 4. Chain Operations Safely 🔗

```typescript
async function processUserWorkflow(userId: number) {
  const userResult = await fetchUser(userId);
  if (userResult.type !== "SUCCESS_API") {
    return userResult; // Propagate error
  }
  
  const validationResult = validateUser(userResult.data.data);
  if (validationResult.type !== "SUCCESS_USER_VALID") {
    return validationResult; // Propagate validation error
  }
  
  // Continue with valid user...
  return Result.ok("SUCCESS_WORKFLOW_COMPLETE", validationResult.data);
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the [Unlicense](http://unlicense.org/) - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Rust's `Result<T, E>` type
- Built with TypeScript's powerful type system
- Designed for modern JavaScript/TypeScript applications

---

**Made with ❤️ by [voiys](https://github.com/voiys)**