import type { DType, IsRequired } from "./dtype";

export type RequiredKey<TKey extends string, T extends DType> =
  T extends IsRequired<T> ? TKey : never;

export type OptionalKey<TKey extends string, T extends DType> =
  T extends IsRequired<T> ? never : TKey;
