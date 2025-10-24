import { HORSEPOWER_COMMENT_REGEX } from './horsepower-comment-regex.js';
import {
  VALID_HORSEPOWER_STRINGS,
  INVALID_HORSEPOWER_STRINGS
} from './horsepower-test-data.js';

describe('horsepower-comment-regex', () => {
  describe('should match valid horsepower comments', () => {
    VALID_HORSEPOWER_STRINGS.forEach((testString) => {
      it(`should match: "${testString}"`, () => {
        expect(HORSEPOWER_COMMENT_REGEX.test(testString)).toBe(true);
      });
    });
  });

  describe('should NOT match invalid horsepower comments', () => {
    INVALID_HORSEPOWER_STRINGS.forEach((testString) => {
      it(`should NOT match: "${testString}"`, () => {
        expect(HORSEPOWER_COMMENT_REGEX.test(testString)).toBe(false);
      });
    });
  });
});
