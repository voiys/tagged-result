import { describe, expect, test } from "vitest";
import { Result } from "../src/index";
import type { ResultUnion } from "../src/index";

describe("Result utility", () => {
	describe("Result.ok", () => {
		test("should create a success result with default type", () => {
			const result = Result.ok({ value: 42 });

			expect(result.type).toBe("success");
			expect(result.data).toEqual({ value: 42 });
		});

		test("should create a success result with custom type", () => {
			const result = Result.ok("USER_CREATED", { id: 123, name: "John" });

			expect(result.type).toBe("USER_CREATED");
			expect(result.data).toEqual({ id: 123, name: "John" });
		});

		test("should handle primitive data types", () => {
			const stringResult = Result.ok("success", "hello world");
			const numberResult = Result.ok("COMPUTED", 42);
			const booleanResult = Result.ok(true);

			expect(stringResult.type).toBe("success");
			expect(stringResult.data).toBe("hello world");

			expect(numberResult.type).toBe("COMPUTED");
			expect(numberResult.data).toBe(42);

			expect(booleanResult.type).toBe("success");
			expect(booleanResult.data).toBe(true);
		});
	});

	describe("Result.err", () => {
		test("should create an error result with default type", () => {
			const result = Result.err({ message: "Something went wrong" });

			expect(result.type).toBe("error");
			expect(result.data).toEqual({ message: "Something went wrong" });
		});

		test("should create an error result with custom type", () => {
			const result = Result.err("VALIDATION_ERROR", {
				field: "email",
				message: "Invalid format",
			});

			expect(result.type).toBe("VALIDATION_ERROR");
			expect(result.data).toEqual({
				field: "email",
				message: "Invalid format",
			});
		});

		test("should handle Error objects", () => {
			const error = new Error("Network timeout");
			const result = Result.err("NETWORK_ERROR", error);

			expect(result.type).toBe("NETWORK_ERROR");
			expect(result.data).toBe(error);
		});
	});

	describe("Type discrimination", () => {
		test("should allow type discrimination in conditional logic", () => {
			type ProcessResult =
				| ResultUnion<"PROCESSED", { result: string }>
				| ResultUnion<"FAILED", { error: string }>;

			const successResult: ProcessResult = Result.ok("PROCESSED", {
				result: "done",
			});
			const errorResult: ProcessResult = Result.err("FAILED", {
				error: "timeout",
			});

			// Test success case
			if (successResult.type === "PROCESSED") {
				expect(successResult.data.result).toBe("done");
				// TypeScript should know this is { result: string }
			} else {
				expect.fail("Should be PROCESSED type");
			}

			// Test error case
			if (errorResult.type === "FAILED") {
				expect(errorResult.data.error).toBe("timeout");
				// TypeScript should know this is { error: string }
			} else {
				expect.fail("Should be FAILED type");
			}
		});
	});

	describe("Real-world usage patterns", () => {
		function processUser(
			id: number,
		):
			| ResultUnion<"USER_FOUND", { name: string; email: string }>
			| ResultUnion<"USER_NOT_FOUND", { id: number }> {
			if (id === 123) {
				return Result.ok("USER_FOUND", {
					name: "John Doe",
					email: "john@example.com",
				});
			}
			return Result.err("USER_NOT_FOUND", { id });
		}

		test("should work in realistic function scenarios", () => {
			const foundUser = processUser(123);
			const notFoundUser = processUser(999);

			expect(foundUser.type).toBe("USER_FOUND");
			if (foundUser.type === "USER_FOUND") {
				expect(foundUser.data.name).toBe("John Doe");
				expect(foundUser.data.email).toBe("john@example.com");
			}

			expect(notFoundUser.type).toBe("USER_NOT_FOUND");
			if (notFoundUser.type === "USER_NOT_FOUND") {
				expect(notFoundUser.data.id).toBe(999);
			}
		});

		function parseNumber(
			input: string,
		):
			| ResultUnion<"PARSED", number>
			| ResultUnion<"PARSE_ERROR", { input: string; reason: string }> {
			const num = Number(input);
			if (Number.isNaN(num)) {
				return Result.err("PARSE_ERROR", {
					input,
					reason: "Not a valid number",
				});
			}
			return Result.ok("PARSED", num);
		}

		test("should handle parsing scenarios", () => {
			const validParse = parseNumber("42");
			const invalidParse = parseNumber("not-a-number");

			expect(validParse.type).toBe("PARSED");
			if (validParse.type === "PARSED") {
				expect(validParse.data).toBe(42);
			}

			expect(invalidParse.type).toBe("PARSE_ERROR");
			if (invalidParse.type === "PARSE_ERROR") {
				expect(invalidParse.data.input).toBe("not-a-number");
				expect(invalidParse.data.reason).toBe("Not a valid number");
			}
		});
	});
});
