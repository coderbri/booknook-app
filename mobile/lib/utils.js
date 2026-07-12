/**
 * @file utils.js
 * @description General-purpose helper functions containing data string transformations and parsers.
 */

/**
 * Converts dynamic MongoDB ISO timestamp strings into short, month-year tracking labels.
 * @param {string} dateString - Source ISO timestamp format string (e.g., "2026-07-11T00:00:00.000Z")
 * @returns {string} Formatted output string (e.g., "Jul 2026")
 */
export function formatMemberSince(dateString) {
    const date = new Date(dateString);
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    return `${month} ${year}`;
}

/**
 * Transforms dynamic database dates into fully localized long-form display records.
 * @param {string} dateString - Source ISO timestamp format string
 * @returns {string} Localized text sequence (e.g., "July 11, 2026")
 */
export function formatPublishDate(dateString) {
    const date = new Date(dateString);
    const month = date.toLocaleString("default", { month: "long" });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
}