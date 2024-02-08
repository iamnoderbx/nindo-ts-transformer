"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchDiagnostic = exports.captureDiagnostic = void 0;
const typescript_1 = __importDefault(require("typescript"));
function captureDiagnostic(cb, ...args) {
    try {
        return { success: true, value: cb(...args) };
    }
    catch (e) {
        if ("diagnostic" in e) {
            /// Temporary workaround for 1.1.1
            if (typescript_1.default.version.startsWith("1.1.1") &&
                !typescript_1.default.version.startsWith("1.1.1-dev") &&
                !globalThis.RBXTSC_DEV) {
                e.diagnostic = undefined;
                throw e;
            }
            return { success: false, diagnostic: e.diagnostic };
        }
        throw e;
    }
}
exports.captureDiagnostic = captureDiagnostic;
function catchDiagnostic(fallback, cb) {
    var _a;
    const result = captureDiagnostic(cb);
    return (_a = result.value) !== null && _a !== void 0 ? _a : fallback;
}
exports.catchDiagnostic = catchDiagnostic;
