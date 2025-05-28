// --- Internal Type Definitions ---
// (These are not directly exported but are used by the exported types/functions)

/**
 * The internal representation of the result union.
 * Exported via the public `ResultUnion` type alias.
 */
type InternalResultUnion<T extends string, D> = {
	type: T;
	data: D;
};

/**
 * Internal helper type for suggested success string literals.
 * Exported via the public `SuggestedSuccessType` type alias.
 */
type InternalSuggestedSuccessType = "success" | (string & {});

/**
 * Internal helper type for suggested error string literals.
 * Exported via the public `SuggestedErrorType` type alias.
 */
type InternalSuggestedErrorType = "error" | (string & {});

// --- Function Implementations ---

// Overloads for the 'ok' function
function ok<D>(data: D): InternalResultUnion<"success", D>;
function ok<T extends InternalSuggestedSuccessType, D>(
	type: T,
	data: D,
): InternalResultUnion<T, D>;
// Implementation of 'ok'
function ok<T extends InternalSuggestedSuccessType, D>(
	...args: [D] | [T, D]
): InternalResultUnion<T | "success", D> {
	// The implementation's return type covers both overloads
	if (args.length === 1) {
		// Corresponds to: ok<D>(data: D)
		// Here, T is effectively "success" from the perspective of the wider return type,
		// but within this branch, we know the type is literally "success".
		return {
			type: "success",
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
function err<D>(data: D): InternalResultUnion<"error", D>;
function err<T extends InternalSuggestedErrorType, D>(
	type: T,
	data: D,
): InternalResultUnion<T, D>;
// Implementation of 'err'
function err<T extends InternalSuggestedErrorType, D>(
	...args: [D] | [T, D]
): InternalResultUnion<T | "error", D> {
	// The implementation's return type covers both overloads
	if (args.length === 1) {
		// Corresponds to: err<D>(data: D)
		return {
			type: "error",
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
 * function doSomething(): ResultUnion<"MY_SUCCESS", { value: number }> | ResultUnion<"MY_ERROR", { message: string }> {
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
export type ResultUnion<T extends string, D> = InternalResultUnion<T, D>;

/**
 * Suggested string literal types for use as the `type` field in successful `ResultUnion` objects.
 * While `Result.ok` allows any string for the type, this provides "success" as a common default
 * and allows other specific success types.
 *
 * @example
 * ```typescript
 * const res1 = Result.ok("success", { id: 1 }); // type is "success"
 * const res2 = Result.ok("USER_LOADED", { name: "Alice" }); // type is "USER_LOADED"
 * ```
 */
export type SuggestedSuccessType = InternalSuggestedSuccessType;

/**
 * Suggested string literal types for use as the `type` field in error `ResultUnion` objects.
 * While `Result.err` allows any string for the type, this provides "error" as a common default
 * and allows other specific error types.
 *
 * @example
 * ```typescript
 * const res1 = Result.err("error", { message: "default error" }); // type is "error"
 * const res2 = Result.err("NOT_FOUND", { resourceId: "abc" }); // type is "NOT_FOUND"
 * ```
 */
export type SuggestedErrorType = InternalSuggestedErrorType;

/**
 * A utility object containing helper functions to create `ResultUnion` objects
 * for representing operation outcomes (success or error).
 *
 * @example
 * ```typescript
 * import { Result, ResultUnion } from 'tagged-result';
 *
 * function process(): ResultUnion<"PROCESSED", string> | ResultUnion<"FAILED", Error> {
 *   try {
 *     const data = someOperation();
 *     return Result.ok("PROCESSED", data);
 *   } catch (e) {
 *     return Result.err("FAILED", e as Error);
 *   }
 * }
 * ```
 */
export const Result = {
	ok,
	err,
};
