/**
 * Normalizes a service code by removing any suffix after the colon (:).
 * e.g., "S5130:UC" becomes "S5130".
 */
export function normalizeServiceCode(code: string): string {
    if (!code) return "";
    return code.split(":")[0]?.trim() ?? "";
}

/**
 * Compares two service codes for equality after normalization.
 * e.g., areServiceCodesEqual("S5130:UC", "S5130") returns true.
 */
export function areServiceCodesEqual(codeA: string, codeB: string): boolean {
    if (!codeA || !codeB) return false;
    return normalizeServiceCode(codeA) === normalizeServiceCode(codeB);
}

/**
 * Checks if a service code starts with another service code after normalization.
 */
export function serviceCodeStartsWith(code: string, prefix: string): boolean {
    if (!code || !prefix) return false;
    return normalizeServiceCode(code).startsWith(prefix);
}
