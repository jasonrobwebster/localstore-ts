export type Simplify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Update<T, TUpdate> = {
  [K in Exclude<keyof T, keyof TUpdate>]: T[K];
} & TUpdate;
