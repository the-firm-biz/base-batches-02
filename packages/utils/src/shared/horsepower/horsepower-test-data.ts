export const VALID_HORSEPOWER_STRINGS = [
  '𓃗 +112412411 HORSEPOWER (HP) has been awarded',
  '𓃗 -50 HORSEPOWER (HP) has been deducted',
  '𓃗 +1 HORSEPOWER (HP) has been',
  'You earned 𓃗 +111 HORSEPOWER (HP) has been awarded to your account',
  '𓃗 +999 HORSEPOWER (HP) has been granted',
  '𓃗+111 HORSEPOWER (HP) has been',
  'oh dear you lost 𓃗 -50 HORSEPOWER (HP)',
  'myspacebarbroke,𓃗+99999HORSEPOWER(HP)isnowyours',
  'my spacebar broke half way through, 𓃗+123456HORSEPOWER(HP)isnowyours',
  'myspacebarfixedhalfwaythrough,𓃗+111HORSEPOWER(HP) is now yours',
  '𓃗 +111 horsepower (HP) has been',
  '𓃗 +111 HORSEPOWER (hp) has been',
  '𓃗 +111 HORSEPOWER (HP) has been',
  '𓃗 +111 HORSEPOWER (HP)',
  '𓃗 +111 HORSEPOWER (HP) awarded',
  '𓃗 -21474 HORSEPOWER (HP) deducted',
  '𓃗 +1 HORSEPOWER (HP) granted',
  '𓃗 +0 HORSEPOWER (HP) given',
  '𓃗 +1,100 HORSEPOWER (HP)',
  '𓃗 +1,1,0,0 horsepower (hp) awarded'
];

export const VALID_HORSEPOWER_EXTRACTION_CASES = [
  {
    input: '𓃗 +112412411 HORSEPOWER (HP) has been awarded',
    expected: 112412411
  },
  { input: '𓃗 -50 HORSEPOWER (HP) has been deducted', expected: -50 },
  { input: '𓃗 +1 HORSEPOWER (HP) has been', expected: 1 },
  {
    input: 'You earned 𓃗 +111 HORSEPOWER (HP) has been awarded to your account',
    expected: 111
  },
  { input: '𓃗 +999 HORSEPOWER (HP) has been granted', expected: 999 },
  { input: '𓃗+111 HORSEPOWER (HP) has been', expected: 111 },
  { input: 'oh dear you lost 𓃗 -50 HORSEPOWER (HP)', expected: -50 },
  {
    input: 'myspacebarbroke,𓃗+99999HORSEPOWER(HP)isnowyours',
    expected: 99999
  },
  {
    input:
      'my spacebar broke half way through, 𓃗+123456HORSEPOWER(HP)isnowyours',
    expected: 123456
  },
  {
    input: 'myspacebarfixedhalfwaythrough,𓃗+111HORSEPOWER(HP) is now yours',
    expected: 111
  },
  { input: '𓃗 +111 horsepower (HP) has been', expected: 111 },
  { input: '𓃗 +111 HORSEPOWER (hp) has been', expected: 111 },
  { input: '𓃗 +111 HORSEPOWER (HP) has been', expected: 111 },
  { input: '𓃗 +111 HORSEPOWER (HP)', expected: 111 },
  { input: '𓃗 +111 HORSEPOWER (HP) awarded', expected: 111 },
  {
    input: '𓃗 -21474 HORSEPOWER (HP) deducted',
    expected: -21474
  },
  { input: '𓃗 +1 HORSEPOWER (HP) granted', expected: 1 },
  { input: '𓃗 +0 HORSEPOWER (HP) given', expected: 0 },
  { input: '𓃗 +1,100 HORSEPOWER (HP)', expected: 1100 },
  { input: '𓃗 +1,1,0,0 horsepower (hp) awarded', expected: 1100 }
];

export const INVALID_HORSEPOWER_STRINGS = [
  'horse +111 HORSEPOWER (HP) has been', // missing emoji
  '+111 HORSEPOWER (HP) without emoji', // missing emoji
  '𓃗 +111 HORSEPOWER has been', // - no (HP)
  '𓃗 50 horsepower earned', // no (HP)
  '𓃗 +111 HORSEPOWER HP has been', // no (HP)
  '𓃗 +111 HORSE POWER (HP) has been', // space in horsepower
  '𓃗 +111 POWER (HP) has been', // wrong keyword
  '𓃗 +111 POWER without horsepower keyword', // wrong keyword
  '𓃗 +111 XP has been awarded', // different metric
  'Just some regular text',
  'horsepower me up daddio',
  '𓃗 HORSEPOWER (HP) bonus', // missing number
  '𓃗 100 HORSEPOWER (HP) bonus', // missing + or -
  '𓃗 ?100 HORSEPOWER (HP) bonus', // wrong symbol
  '𓃗 MAXIMUM HORSEPOWER (HP) has been reached', // no "MAXIMUM" allowed
  '' // empty string
];
