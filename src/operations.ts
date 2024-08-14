import type { DType, HasDefault, IsRequired } from "./dtype";

export type RequiredKey<TKey extends string, T extends DType> =
  T extends IsRequired<T> ? (T extends HasDefault<T> ? never : TKey) : never;

export type OptionalKey<TKey extends string, T extends DType> =
  T extends IsRequired<T> ? (T extends HasDefault<T> ? TKey : never) : TKey;
