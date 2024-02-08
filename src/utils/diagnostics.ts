import ts from "typescript";

/**
 * @file diagnostics.ts
 * @author iAmNode, fireboltofdeath
 */

// Define a type that represents either a value or a diagnostic
type ValueOrDiagnostic<T> =
	// If success is true, the value is present and the diagnostic is optional
	| { success: true; diagnostic?: ts.DiagnosticWithLocation; value: T }
	// If success is false, the diagnostic is present and the value is optional
	| { success: false; diagnostic: ts.DiagnosticWithLocation; value?: T };

// Define a function to capture a diagnostic
export function captureDiagnostic<T, A extends unknown[]>(cb: (...args: A) => T, ...args: A): ValueOrDiagnostic<T> {
	try {
		// Try to execute the callback and return the result
		return { success: true, value: cb(...args) };
	} catch (e: any) {
		// If an error occurs and it has a diagnostic, handle it
		if ("diagnostic" in e) {
			// Temporary workaround for version 1.1.1
			if (
				ts.version.startsWith("1.1.1") &&
				!ts.version.startsWith("1.1.1-dev") &&
				!(globalThis as { RBXTSC_DEV?: boolean }).RBXTSC_DEV
			) {
				e.diagnostic = undefined;
				throw e;
			}

			// Return the diagnostic
			return { success: false, diagnostic: e.diagnostic };
		}
		// If the error does not have a diagnostic, throw it
		throw e;
	}
}

// Define a function to catch a diagnostic
export function catchDiagnostic<T>(fallback: T, cb: () => T): T {
	// Capture the diagnostic
	const result = captureDiagnostic(cb);
	// If a value is present, return it, otherwise return the fallback
	return result.value ?? fallback;
}