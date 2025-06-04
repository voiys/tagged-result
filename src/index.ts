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
function ok<T extends Uppercase<string>, D>(
	type: T extends Uppercase<T> ? T : never,
	data: D,
): InternalResultType<`SUCCESS_${T}`, D>;
// Implementation of 'ok'
function ok<T extends Uppercase<string>, D>(
	...args: [D] | [T extends Uppercase<T> ? T : never, D]
): InternalResultType<"SUCCESS" | `SUCCESS_${T}`, D> {
	if (args.length === 1) {
		// Corresponds to: ok<D>(data: D)
		return {
			type: "SUCCESS",
			data: args[0] as D,
		};
	}
	// Corresponds to: ok<T extends Uppercase<string>, D>(type: T, data: D)
	// The type is already uppercase, just add SUCCESS_ prefix
	const prefixedType = `SUCCESS_${args[0]}` as `SUCCESS_${T}`;
	return {
		type: prefixedType,
		data: args[1] as D,
	};
}

// Overloads for the 'err' function
function err<D>(data: D): InternalResultType<"ERROR", D>;
function err<T extends Uppercase<string>, D>(
	type: T extends Uppercase<T> ? T : never,
	data: D,
): InternalResultType<`ERROR_${T}`, D>;
// Implementation of 'err'
function err<T extends Uppercase<string>, D>(
	...args: [D] | [T extends Uppercase<T> ? T : never, D]
): InternalResultType<"ERROR" | `ERROR_${T}`, D> {
	if (args.length === 1) {
		// Corresponds to: err<D>(data: D)
		return {
			type: "ERROR",
			data: args[0] as D,
		};
	}
	// Corresponds to: err<T extends Uppercase<string>, D>(type: T, data: D)
	// The type is already uppercase, just add ERROR_ prefix
	const prefixedType = `ERROR_${args[0]}` as `ERROR_${T}`;
	return {
		type: prefixedType,
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
 * function doSomething(): ResultType<"SUCCESS_MY", { value: number }> | ResultType<"ERROR_MY", { message: string }> {
 *   if (Math.random() > 0.5) {
 *     return Result.ok("MY", { value: 42 }); // becomes "SUCCESS_MY"
 *   } else {
 *     return Result.err("MY", { message: "Something went wrong" }); // becomes "ERROR_MY"
 *   }
 * }
 *
 * const result = doSomething();
 * if (result.type === "SUCCESS_MY") {
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
 * const res1 = Result.ok({ id: 1 }); // type is "SUCCESS"
 * const res2 = Result.ok("USER_LOADED", { name: "Alice" }); // type is "SUCCESS_USER_LOADED"
 * ```
 */
export type SuggestedSuccessType = InternalSuggestedSuccessType;

/**
 * Suggested string literal types for use as the `type` field in error `ResultType` objects.
 * Types must follow the pattern "ERROR" or "ERROR_" followed by uppercase string.
 *
 * @example
 * ```typescript
 * const res1 = Result.err({ message: "default error" }); // type is "ERROR"
 * const res2 = Result.err("NOT_FOUND", { resourceId: "abc" }); // type is "ERROR_NOT_FOUND"
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
 *     return Result.ok("PROCESSED", data); // becomes "SUCCESS_PROCESSED"
 *   } catch (e) {
 *     return Result.err("FAILED", e as Error); // becomes "ERROR_FAILED"
 *   }
 * }
 * ```
 */
export const Result = {
	ok,
	err,
};
