
export function isValidTopic(keyword: string): boolean {
    if (!keyword) return false;
    const trimmed = keyword.trim();
    if (trimmed.length === 0) return false;
    if (trimmed.length > 50) return false; // Max length constraint
    return true;
}
