// --- Internal Type Definitions ---

/**
 * The internal representation of the result union.
 * Exported via the public `ResultType` type alias.
 */
type InternalResultType<T extends string, D> = {
	type: T;
	data: D;
};

// --- Function Implementations ---

// Overloads for the 'ok' function
function ok<D>(data: D): InternalResultType<"SUCCESS", D>;
function ok<T extends Uppercase<string>, D>(
	type: T,
	data: D,
): InternalResultType<`SUCCESS_${T}`, D>;
// Implementation of 'ok'
function ok<T extends Uppercase<string>, D>(
	...args: [D] | [T, D]
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
 * A specialized version of ResultType specifically for success outcomes.
 * The type parameter will automatically be prefixed with "SUCCESS_" or default to "SUCCESS".
 *
 * @template T - The string literal representing the specific success type (e.g., "USER_CREATED", "DATA_LOADED")
 * @template D - The type of the data payload associated with this success result
 *
 * @example
 * ```typescript
 * function createUser(): SuccessResultType<"USER_CREATED", { id: number, name: string }> {
 *   return Result.ok("USER_CREATED", { id: 123, name: "Alice" });
 * }
 * ```
 */
export type SuccessResultType<
	T extends Uppercase<string>,
	D,
> = InternalResultType<T extends "" ? "SUCCESS" : `SUCCESS_${Uppercase<T>}`, D>;

/**
 * A specialized version of ResultType specifically for error outcomes.
 * The type parameter will automatically be prefixed with "ERROR_" or default to "ERROR".
 *
 * @template T - The string literal representing the specific error type (e.g., "VALIDATION_FAILED", "NOT_FOUND")
 * @template D - The type of the data payload associated with this error result
 *
 * @example
 * ```typescript
 * function validateUser(): ErrorResultType<"VALIDATION_FAILED", { field: string, message: string }> {
 *   return Result.err("VALIDATION_FAILED", { field: "email", message: "Invalid format" });
 * }
 * ```
 */
export type ErrorResultType<
	T extends Uppercase<string>,
	D,
> = InternalResultType<T extends "" ? "ERROR" : `ERROR_${Uppercase<T>}`, D>;

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
