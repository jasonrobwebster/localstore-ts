import type { DType, HasDefault, IsRequired } from "./dtype";

export type RequiredKey<
  TKey extends string,
  T extends DType,
  Mode extends "get" | "set" = "set",
> =
  T extends IsRequired<T>
    ? T extends HasDefault<T>
      ? Mode extends "get"
        ? TKey
        : never
      : TKey
    : Mode extends "get"
      ? T extends HasDefault<T>
        ? TKey
        : never
      : never;

export type OptionalKey<
  TKey extends string,
  T extends DType,
  Mode extends "get" | "set" = "set",
> =
  T extends IsRequired<T>
    ? T extends HasDefault<T>
      ? Mode extends "get"
        ? never
        : TKey
      : never
    : Mode extends "get"
      ? T extends HasDefault<T>
        ? never
        : TKey
      : TKey;
