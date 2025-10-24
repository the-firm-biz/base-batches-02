import { HORSEPOWER_COMMENT_REGEX } from './horsepower-comment-regex.js';

/**
 * Extracts the horsepower value from a string that matches HORSEPOWER_COMMENT_REGEX
 * @param text - The text containing a horsepower comment
 * @returns The numeric HP value (positive or negative) or null if no match found
 */
export function extractHorsepowerValue(text: string): number | null {
  const match = text.match(HORSEPOWER_COMMENT_REGEX);

  if (!match || !match[1]) {
    return null;
  }

  return parseInt(match[1].replace(/,/g, ''), 10);
}
