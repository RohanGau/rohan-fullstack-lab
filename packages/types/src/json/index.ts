/** A DTO as it arrives over HTTP: JSON has no Date, so dates are ISO strings. */
export type Jsonified<T> = {
  [K in keyof T]: T[K] extends Date ? string : T[K];
};
