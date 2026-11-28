import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare module 'vitest' {
  // Bridge @testing-library/jest-dom matchers to Vitest v5's 2-type-param Assertion<R, T>.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-object-type
  interface Assertion<R, T> extends TestingLibraryMatchers<any, R> {}
}
