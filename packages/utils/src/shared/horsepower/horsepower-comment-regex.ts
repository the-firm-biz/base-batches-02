/**
 * Used to validate the data received from the neynar webhook
 * https://dev.neynar.com/webhook
 *
 * The cast text is validated against the following pattern:
 * Pattern: {PREFIX}𓃗 [+/-]NUMBER HORSEPOWER (HP){SUFFIX}
 * White spaces are optional
 * */
export const HORSEPOWER_COMMENT_REGEX = /𓃗\s*([+-][\d,]+)\s*HORSEPOWER\s*\(HP\)/i;
