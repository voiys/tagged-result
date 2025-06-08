import { describe, expect, test } from "vitest";
import { Result } from "../src/index";
import type { ErrorResultType, SuccessResultType } from "../src/index";

describe("Result utility", () => {
	describe("Result.ok", () => {
		test("should create a success result with default type", () => {
			const result = Result.ok({ value: 42 });

			expect(result.type).toBe("SUCCESS");
			expect(result.data).toEqual({ value: 42 });
		});

		test("should create a success result with custom type", () => {
			const result = Result.ok("USER_CREATED", {
				id: 123,
				name: "John",
			});

			expect(result.type).toBe("SUCCESS_USER_CREATED");
			expect(result.data).toEqual({ id: 123, name: "John" });
		});

		test("should handle primitive data types", () => {
			const stringResult = Result.ok("hello world");
			const numberResult = Result.ok("COMPUTED", 42);
			const booleanResult = Result.ok(true);

			expect(stringResult.type).toBe("SUCCESS");
			expect(stringResult.data).toBe("hello world");

			expect(numberResult.type).toBe("SUCCESS_COMPUTED");
			expect(numberResult.data).toBe(42);

			expect(booleanResult.type).toBe("SUCCESS");
			expect(booleanResult.data).toBe(true);
		});
	});

	describe("Result.err", () => {
		test("should create an error result with default type", () => {
			const result = Result.err({ message: "Something went wrong" });

			expect(result.type).toBe("ERROR");
			expect(result.data).toEqual({ message: "Something went wrong" });
		});

		test("should create an error result with custom type", () => {
			const result = Result.err("ERROR_VALIDATION", {
				field: "email",
				message: "Invalid format",
			});

			expect(result.type).toBe("ERROR_ERROR_VALIDATION");
			expect(result.data).toEqual({
				field: "email",
				message: "Invalid format",
			});
		});

		test("should handle Error objects", () => {
			const error = new Error("Network timeout");
			const result = Result.err("ERROR_NETWORK", error);

			expect(result.type).toBe("ERROR_ERROR_NETWORK");
			expect(result.data).toBe(error);
		});
	});

	describe("Type discrimination", () => {
		test("should allow type discrimination in conditional logic", () => {
			const successResult: SuccessResultType<"PROCESSED", { result: string }> =
				Result.ok("PROCESSED", {
					result: "done",
				});
			const errorResult: ErrorResultType<"FAILED", { error: string }> =
				Result.err("FAILED", {
					error: "timeout",
				});

			// Test success case
			if (successResult.type === "SUCCESS_PROCESSED") {
				expect(successResult.data.result).toBe("done");
				// TypeScript should know this is { result: string }
			} else {
				expect.fail("Should be SUCCESS_PROCESSED type");
			}

			// Test error case
			if (errorResult.type === "ERROR_FAILED") {
				expect(errorResult.data.error).toBe("timeout");
				// TypeScript should know this is { error: string }
			} else {
				expect.fail("Should be ERROR_FAILED type");
			}
		});
	});

	describe("Real-world usage patterns", () => {
		function processUser(id: number) {
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

			expect(foundUser.type).toBe("SUCCESS_USER_FOUND");
			if (foundUser.type === "SUCCESS_USER_FOUND") {
				expect(foundUser.data.name).toBe("John Doe");
				expect(foundUser.data.email).toBe("john@example.com");
			}

			expect(notFoundUser.type).toBe("ERROR_USER_NOT_FOUND");
			if (notFoundUser.type === "ERROR_USER_NOT_FOUND") {
				expect(notFoundUser.data.id).toBe(999);
			}
		});

		function parseNumber(input: string) {
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

			expect(validParse.type).toBe("SUCCESS_PARSED");
			if (validParse.type === "SUCCESS_PARSED") {
				expect(validParse.data).toBe(42);
			}

			expect(invalidParse.type).toBe("ERROR_PARSE_ERROR");
			if (invalidParse.type === "ERROR_PARSE_ERROR") {
				expect(invalidParse.data.input).toBe("not-a-number");
				expect(invalidParse.data.reason).toBe("Not a valid number");
			}
		});
	});
});

describe("README Examples", () => {
	describe("Quick Start Examples", () => {
		test("should work with generic success/error (simple overload)", () => {
			const success = Result.ok({ id: 123, name: "Alice" });
			const error = Result.err({ message: "Something went wrong" });

			expect(success.type).toBe("SUCCESS");
			expect(success.data).toEqual({ id: 123, name: "Alice" });

			expect(error.type).toBe("ERROR");
			expect(error.data).toEqual({ message: "Something went wrong" });
		});

		test("should work with custom tagged variants (descriptive overload)", () => {
			const tagged = Result.ok("USER_CREATED", {
				id: 123,
				name: "Alice",
			});
			const failure = Result.err("VALIDATION_FAILED", { field: "email" });

			expect(tagged.type).toBe("SUCCESS_USER_CREATED");
			expect(tagged.data).toEqual({ id: 123, name: "Alice" });

			expect(failure.type).toBe("ERROR_VALIDATION_FAILED");
			expect(failure.data).toEqual({ field: "email" });

			// TypeScript narrows automatically
			if (tagged.type === "SUCCESS_USER_CREATED") {
				expect(tagged.data.name).toBe("Alice"); // TypeScript knows this is string
			}
		});
	});

	describe("API Reference Examples", () => {
		test("Result.ok with default and custom types", () => {
			// Using default "SUCCESS" type
			const result1 = Result.ok({ value: 42 });
			expect(result1.type).toBe("SUCCESS");
			expect(result1.data).toEqual({ value: 42 });

			// Using custom type
			const result2 = Result.ok("SUCCESS_DATA_LOADED", { items: [] });
			expect(result2.type).toBe("SUCCESS_SUCCESS_DATA_LOADED");
			expect(result2.data).toEqual({ items: [] });
		});

		test("Result.err with default and custom types", () => {
			// Using default "ERROR" type
			const result1 = Result.err({ message: "Something went wrong" });
			expect(result1.type).toBe("ERROR");
			expect(result1.data).toEqual({ message: "Something went wrong" });

			// Using custom type
			const result2 = Result.err("ERROR_NOT_FOUND", { resourceId: "user-123" });
			expect(result2.type).toBe("ERROR_ERROR_NOT_FOUND");
			expect(result2.data).toEqual({ resourceId: "user-123" });
		});
	});

	describe("Synchronous Examples", () => {
		// Let TypeScript infer the return type
		function parseNumber(input: string) {
			const num = Number.parseInt(input, 10);
			if (Number.isNaN(num)) {
				return Result.err("INVALID_NUMBER", { input });
			}
			return Result.ok("PARSED", { value: num });
		}

		interface UserData {
			id?: unknown;
			name?: string;
		}

		// Or force a specific return type
		function validateUser(data: UserData) {
			if (!data.id || typeof data.id !== "number") {
				return Result.err("INVALID", { error: "ID must be a number" });
			}
			return Result.ok("VALID", { id: data.id });
		}

		test("parseNumber function from README", () => {
			const validResult = parseNumber("42");
			const invalidResult = parseNumber("abc");

			expect(validResult.type).toBe("SUCCESS_PARSED");
			if (validResult.type === "SUCCESS_PARSED") {
				expect(validResult.data.value).toBe(42);
			}

			expect(invalidResult.type).toBe("ERROR_INVALID_NUMBER");
			if (invalidResult.type === "ERROR_INVALID_NUMBER") {
				expect(invalidResult.data.input).toBe("abc");
			}
		});

		test("validateUser function from README", () => {
			const validData = { id: 123, name: "Alice" };
			const invalidData = { name: "Bob" };

			const validResult = validateUser(validData);
			const invalidResult = validateUser(invalidData);

			expect(validResult.type).toBe("SUCCESS_VALID");
			if (validResult.type === "SUCCESS_VALID") {
				expect(validResult.data.id).toBe(123);
			}

			expect(invalidResult.type).toBe("ERROR_INVALID");
			if (invalidResult.type === "ERROR_INVALID") {
				expect(invalidResult.data.error).toBe("ID must be a number");
			}
		});
	});

	describe("Asynchronous Examples (Mocked)", () => {
		interface MockResponse {
			ok: boolean;
			status: number;
			data?: unknown;
		}

		// Let TypeScript infer the return type
		async function fetchData(url: string, mockResponse: MockResponse) {
			try {
				// Simulate fetch behavior
				const response = mockResponse;
				if (!response.ok) {
					return Result.err("HTTP_ERROR", { status: response.status });
				}
				const data = mockResponse.data || { id: 123, name: "Test Data" };
				return Result.ok(data);
			} catch (error) {
				return Result.err("NETWORK_ERROR", {
					message: (error as Error).message,
				});
			}
		}

		interface User {
			id: number;
			name: string;
		}

		interface GetUserMockResponse {
			status: number;
			data?: User;
			shouldThrow?: boolean;
		}

		// Or force a specific return type
		async function getUser(id: number, mockResponse: GetUserMockResponse) {
			try {
				if (mockResponse.shouldThrow) {
					throw new Error("Network error");
				}

				if (mockResponse.status === 404) {
					return Result.err("NOT_FOUND", { message: "User not found" });
				}
				if (mockResponse.status !== 200) {
					return Result.err({ message: "Failed to fetch user" });
				}

				const user = mockResponse.data || { id, name: "Test User" };
				return Result.ok("USER_FOUND", user);
			} catch (error) {
				return Result.err({ message: (error as Error).message });
			}
		}

		test("fetchData function from README", async () => {
			// Test successful response
			const successResult = await fetchData("http://example.com", {
				ok: true,
				status: 200,
				data: { message: "Success" },
			});
			expect(successResult.type).toBe("SUCCESS");
			if (successResult.type === "SUCCESS") {
				expect(successResult.data).toEqual({ message: "Success" });
			}

			// Test HTTP error
			const httpErrorResult = await fetchData("http://example.com", {
				ok: false,
				status: 500,
			});
			expect(httpErrorResult.type).toBe("ERROR_HTTP_ERROR");
			if (httpErrorResult.type === "ERROR_HTTP_ERROR") {
				expect(httpErrorResult.data.status).toBe(500);
			}
		});

		test("getUser function from README", async () => {
			// Test successful user fetch
			const userResult = await getUser(123, {
				status: 200,
				data: { id: 123, name: "Alice" },
			});
			expect(userResult.type).toBe("SUCCESS_USER_FOUND");
			if (userResult.type === "SUCCESS_USER_FOUND") {
				expect(userResult.data.name).toBe("Alice");
			}

			// Test user not found
			const notFoundResult = await getUser(999, { status: 404 });
			expect(notFoundResult.type).toBe("ERROR_NOT_FOUND");
			if (notFoundResult.type === "ERROR_NOT_FOUND") {
				expect(notFoundResult.data.message).toBe("User not found");
			}

			// Test general error
			const errorResult = await getUser(123, { status: 500 });
			expect(errorResult.type).toBe("ERROR");
			if (errorResult.type === "ERROR") {
				expect(errorResult.data.message).toBe("Failed to fetch user");
			}

			// Test network error
			const networkErrorResult = await getUser(123, {
				status: 200,
				shouldThrow: true,
			});
			expect(networkErrorResult.type).toBe("ERROR");
			if (networkErrorResult.type === "ERROR") {
				expect(networkErrorResult.data.message).toBe("Network error");
			}
		});

		test("switch statement usage from README", async () => {
			const userResult = await getUser(123, {
				status: 200,
				data: { id: 123, name: "Test User" },
			});

			let result: User | string;
			switch (userResult.type) {
				case "SUCCESS_USER_FOUND":
					result = userResult.data; // TypeScript knows this is User
					break;
				case "ERROR_NOT_FOUND":
				case "ERROR":
					result = userResult.data.message;
					break;
				default: {
					// TypeScript will error if we miss a case
					const exhaustive: never = userResult;
					throw new Error("Unhandled result type");
				}
			}

			expect(result).toEqual({ id: 123, name: "Test User" });
		});
	});

	describe("Best Practices Examples", () => {
		test("descriptive tags vs generic tags", () => {
			// ❌ Not descriptive (but still works)
			const genericError = Result.err({ message: "Failed" });
			expect(genericError.type).toBe("ERROR");

			// ✅ Descriptive and actionable
			const descriptiveError = Result.err("VALIDATION_FAILED", {
				field: "email",
				message: "Invalid email format",
			});
			expect(descriptiveError.type).toBe("ERROR_VALIDATION_FAILED");
			expect(descriptiveError.data.field).toBe("email");
		});

		test("grouped related result types", () => {
			interface User {
				id: number;
				name: string;
			}

			const createdResult = Result.ok("USER_CREATED", {
				id: 1,
				name: "Alice",
			});
			const errorResult = Result.err("VALIDATION_ERROR", {
				message: "Invalid data",
			});

			expect(createdResult.type).toBe("SUCCESS_USER_CREATED");
			expect(errorResult.type).toBe("ERROR_VALIDATION_ERROR");
		});

		test("exhaustive checking with switch statements", () => {
			type UserOperationResult =
				| SuccessResultType<
					"USER_CREATED" | "USER_UPDATED",
					{ id: number; name: string }
				>
				| ErrorResultType<
					"USER_NOT_FOUND" | "VALIDATION_ERROR" | "PERMISSION_DENIED",
					{ message: string }
				>;

			function handleResult(result: UserOperationResult) {
				switch (result.type) {
					case "SUCCESS_USER_CREATED":
					case "SUCCESS_USER_UPDATED":
						return result.data; // TypeScript knows this is User
					case "ERROR_USER_NOT_FOUND":
					case "ERROR_VALIDATION_ERROR":
					case "ERROR_PERMISSION_DENIED":
						throw new Error(result.data.message);
					default: {
						// TypeScript will error if we miss a case
						const exhaustive: never = result;
						throw new Error("Unhandled result type");
					}
				}
			}

			const successResult: UserOperationResult = Result.ok("USER_CREATED", {
				id: 1,
				name: "Alice",
			});
			const errorResult: UserOperationResult = Result.err("VALIDATION_ERROR", {
				message: "Invalid email",
			});

			expect(handleResult(successResult)).toEqual({ id: 1, name: "Alice" });
			expect(() => handleResult(errorResult)).toThrow("Invalid email");
		});

		test("chaining operations safely", async () => {
			interface User {
				id: number;
				name: string;
			}

			interface UserData {
				id: number;
				name: string;
				email: string;
			}

			// Mock functions for the workflow
			async function fetchUser(userId: number) {
				if (userId === 999) {
					return Result.err("API_ERROR", { message: "User not found" });
				}
				return Result.ok("API_SUCCESS", {
					data: { id: userId, name: "Test User", email: "invalid-email" },
				});
			}

			function validateUser(
				userData: UserData,
			):
				| SuccessResultType<"USER_VALID", User>
				| ErrorResultType<"USER_INVALID", { message: string }> {
				if (!userData.email || !userData.email.includes("@")) {
					return Result.err("USER_INVALID", { message: "Invalid email" });
				}
				return Result.ok("USER_VALID", {
					id: userData.id,
					name: userData.name,
				});
			}

			async function processUserWorkflow(userId: number) {
				const userResult = await fetchUser(userId);
				if (userResult.type !== "SUCCESS_API_SUCCESS") {
					return userResult; // Propagate error
				}

				const validationResult = validateUser(userResult.data.data);
				if (validationResult.type !== "SUCCESS_USER_VALID") {
					return validationResult; // Propagate validation error
				}

				// Continue with valid user...
				return Result.ok("WORKFLOW_COMPLETE", validationResult.data);
			}

			// Test successful workflow
			const successResult = await processUserWorkflow(123);
			// This will fail validation due to invalid email in mock data
			expect(successResult.type).toBe("ERROR_USER_INVALID");

			// Test API error propagation
			const errorResult = await processUserWorkflow(999);
			expect(errorResult.type).toBe("ERROR_API_ERROR");
		});
	});
});
