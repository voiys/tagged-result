// --- Internal Type Definitions ---
// (These are not directly exported but are used by the exported types/functions)

/**
 * The internal representation of the result union.
 * Exported via the public `ResultType` type alias.
 */
type InternalResultType<T extends string, D> = {
	type: T;
	data: D;
};

/**
 * Internal helper type for suggested success string literals.
 * Exported via the public `SuggestedSuccessType` type alias.
 */
type InternalSuggestedSuccessType = "SUCCESS" | `SUCCESS_${Uppercase<string>}`;

/**
 * Internal helper type for suggested error string literals.
 * Exported via the public `SuggestedErrorType` type alias.
 */
type InternalSuggestedErrorType = "ERROR" | `ERROR_${Uppercase<string>}`;

// --- Function Implementations ---

// Overloads for the 'ok' function
function ok<D>(data: D): InternalResultType<"SUCCESS", D>;
function ok<T extends InternalSuggestedSuccessType, D>(
	type: T,
	data: D,
): InternalResultType<T, D>;
// Implementation of 'ok'
function ok<T extends InternalSuggestedSuccessType, D>(
	...args: [D] | [T, D]
): InternalResultType<T | "SUCCESS", D> {
	// The implementation's return type covers both overloads
	if (args.length === 1) {
		// Corresponds to: ok<D>(data: D)
		// Here, T is effectively "SUCCESS" from the perspective of the wider return type,
		// but within this branch, we know the type is literally "SUCCESS".
		return {
			type: "SUCCESS",
			data: args[0] as D,
		};
	}
	// Corresponds to: ok<T extends SuggestedSuccessType, D>(type: T, data: D)
	return {
		type: args[0] as T,
		data: args[1] as D,
	};
}

// Overloads for the 'err' function
function err<D>(data: D): InternalResultType<"ERROR", D>;
function err<T extends InternalSuggestedErrorType, D>(
	type: T,
	data: D,
): InternalResultType<T, D>;
// Implementation of 'err'
function err<T extends InternalSuggestedErrorType, D>(
	...args: [D] | [T, D]
): InternalResultType<T | "ERROR", D> {
	// The implementation's return type covers both overloads
	if (args.length === 1) {
		// Corresponds to: err<D>(data: D)
		return {
			type: "ERROR",
			data: args[0] as D,
		};
	}
	// Corresponds to: err<T extends SuggestedErrorType, D>(type: T, data: D)
	return {
		type: args[0] as T,
		data: args[1] as D,
	};
}

// --- Public Exports ---

/**
 * The core union type representing either a success or an error outcome.
 * Use this to type return values or variables holding results.
 *
 * @template T - The string literal representing the specific type of the result (e.g., "USER_CREATED", "VALIDATION_ERROR")
 * @template D - The type of the data payload associated with this result
 *
 * @example
 * ```typescript
 * function doSomething(): ResultType<"MY_SUCCESS", { value: number }> | ResultType<"MY_ERROR", { message: string }> {
 *   if (Math.random() > 0.5) {
 *     return Result.ok("MY_SUCCESS", { value: 42 });
 *   } else {
 *     return Result.err("MY_ERROR", { message: "Something went wrong" });
 *   }
 * }
 *
 * const result = doSomething();
 * if (result.type === "MY_SUCCESS") {
 *   console.log(result.data.value); // TypeScript knows this is { value: number }
 * }
 * ```
 */
export type ResultType<T extends string, D> = InternalResultType<T, D>;

/**
 * Suggested string literal types for use as the `type` field in successful `ResultType` objects.
 * Types must follow the pattern "SUCCESS" or "SUCCESS_" followed by uppercase string.
 *
 * @example
 * ```typescript
 * const res1 = Result.ok("SUCCESS", { id: 1 }); // type is "SUCCESS"
 * const res2 = Result.ok("SUCCESS_USER_LOADED", { name: "Alice" }); // type is "SUCCESS_USER_LOADED"
 * ```
 */
export type SuggestedSuccessType = InternalSuggestedSuccessType;

/**
 * Suggested string literal types for use as the `type` field in error `ResultType` objects.
 * Types must follow the pattern "ERROR" or "ERROR_" followed by uppercase string.
 *
 * @example
 * ```typescript
 * const res1 = Result.err("ERROR", { message: "default error" }); // type is "ERROR"
 * const res2 = Result.err("ERROR_NOT_FOUND", { resourceId: "abc" }); // type is "ERROR_NOT_FOUND"
 * ```
 */
export type SuggestedErrorType = InternalSuggestedErrorType;

/**
 * A utility object containing helper functions to create `ResultType` objects
 * for representing operation outcomes (success or error).
 *
 * @example
 * ```typescript
 * import { Result, ResultType } from 'tagged-result';
 *
 * function process(): ResultType<"SUCCESS_PROCESSED", string> | ResultType<"ERROR_FAILED", Error> {
 *   try {
 *     const data = someOperation();
 *     return Result.ok("SUCCESS_PROCESSED", data);
 *   } catch (e) {
 *     return Result.err("ERROR_FAILED", e as Error);
 *   }
 * }
 * ```
 */
export const Result = {
	ok,
	err,
};
