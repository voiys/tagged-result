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
import { Result, ResultUnion } from '@voiys/tagged-result';

// Generic success/error (simple overload)
const success = Result.ok({ id: 123, name: "Alice" });
const error = Result.err({ message: "Something went wrong" });

// Custom tagged variants (descriptive overload)
const tagged = Result.ok("USER_CREATED", { id: 123, name: "Alice" });
const failure = Result.err("VALIDATION_FAILED", { field: "email" });

// TypeScript narrows automatically
if (tagged.type === "USER_CREATED") {
  console.log(tagged.data.name); // TypeScript knows this is string
}
```

## 📋 API Reference

### `Result.ok(data)` & `Result.ok(type, data)`

Creates a successful result with optional custom type tag.

```typescript
// Using default "success" type
const result1 = Result.ok({ value: 42 });
// Type: ResultUnion<"success", { value: number }>

// Using custom type
const result2 = Result.ok("DATA_LOADED", { items: [] });
// Type: ResultUnion<"DATA_LOADED", { items: any[] }>
```

### `Result.err(data)` & `Result.err(type, data)`

Creates an error result with optional custom type tag.

```typescript
// Using default "error" type
const result1 = Result.err({ message: "Something went wrong" });
// Type: ResultUnion<"error", { message: string }>

// Using custom type
const result2 = Result.err("NOT_FOUND", { resourceId: "user-123" });
// Type: ResultUnion<"NOT_FOUND", { resourceId: string }>
```

### `ResultUnion<T, D>`

The core type representing a tagged result.

```typescript
type MyResult = ResultUnion<"SUCCESS" | "FAILED", { message: string }>;
```

## 🔄 Synchronous Example

```typescript
import { Result, ResultUnion } from '@voiys/tagged-result';

// Let TypeScript infer the return type
function parseNumber(input: string) {
  const num = parseInt(input);
  if (isNaN(num)) {
    return Result.err("INVALID_NUMBER", { input });
  }
  return Result.ok("PARSED", { value: num });
}

// Or force a specific return type
function validateUser(data: any): ResultUnion<"VALID", { id: number }> | ResultUnion<"INVALID", { error: string }> {
  if (!data.id || typeof data.id !== 'number') {
    return Result.err("INVALID", { error: "ID must be a number" });
  }
  return Result.ok("VALID", { id: data.id });
}

// Usage
const result = parseNumber("42");
if (result.type === "PARSED") {
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
      return Result.err("HTTP_ERROR", { status: response.status });
    }
    const data = await response.json();
    return Result.ok("SUCCESS", data);
  } catch (error) {
    return Result.err("NETWORK_ERROR", { message: error.message });
  }
}

// Or force a specific return type
async function getUser(id: number): Promise<ResultUnion<"USER_FOUND", User> | ResultUnion<"NOT_FOUND" | "ERROR", { message: string }>> {
  try {
    const response = await fetch(`/users/${id}`);
    if (response.status === 404) {
      return Result.err("NOT_FOUND", { message: "User not found" });
    }
    if (!response.ok) {
      return Result.err("ERROR", { message: "Failed to fetch user" });
    }
    const user = await response.json();
    return Result.ok("USER_FOUND", user);
  } catch (error) {
    return Result.err("ERROR", { message: error.message });
  }
}

// Usage
const userResult = await getUser(123);
switch (userResult.type) {
  case "USER_FOUND":
    console.log('User:', userResult.data); // TypeScript knows this is User
    break;
  case "NOT_FOUND":
  case "ERROR":
    console.error(userResult.data.message);
    break;
}
```

## 🎯 Best Practices

### 1. Use Descriptive Tags 🏷️

```typescript
// ❌ Not descriptive
Result.err("error", { message: "Failed" });

// ✅ Descriptive and actionable
Result.err("VALIDATION_FAILED", { field: "email", message: "Invalid email format" });
```

### 2. Group Related Result Types 📦

```typescript
type UserOperationResult = 
  | ResultUnion<"USER_CREATED" | "USER_UPDATED", User>
  | ResultUnion<"USER_NOT_FOUND" | "VALIDATION_ERROR" | "PERMISSION_DENIED", { message: string }>;
```

### 3. Use Switch Statements for Exhaustive Checking ✅

```typescript
function handleResult(result: UserOperationResult) {
  switch (result.type) {
    case "USER_CREATED":
    case "USER_UPDATED":
      return result.data; // TypeScript knows this is User
    case "USER_NOT_FOUND":
    case "VALIDATION_ERROR":
    case "PERMISSION_DENIED":
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
  if (userResult.type !== "API_SUCCESS") {
    return userResult; // Propagate error
  }
  
  const validationResult = validateUser(userResult.data.data);
  if (validationResult.type !== "USER_VALID") {
    return validationResult; // Propagate validation error
  }
  
  // Continue with valid user...
  return Result.ok("WORKFLOW_COMPLETE", validationResult.data);
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