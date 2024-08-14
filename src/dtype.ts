import type { Simplify } from "./utils";
import { v4 as uuidv4 } from "uuid";

export interface DTypeBaseConfig {
  readonly transient: boolean;
  readonly hasDefault: boolean;
  readonly required: boolean;
}

export type HasDefaultConfig<T extends DTypeBaseConfig> = T & {
  readonly hasDefault: true;
};

export type RequiredConfig<T extends DTypeBaseConfig> = T & {
  readonly required: true;
};

export type WithType<T extends DTypeBaseConfig> = T & {
  readonly $type: unknown;
};

export interface DTypeBase<
  T extends WithType<DTypeBaseConfig> = WithType<DTypeBaseConfig>,
> {
  _: Simplify<T>;
}

export type IsTransient<T extends DTypeBase> = T & {
  _: {
    transient: true;
  };
};

export type HasDefault<T extends DTypeBase> = T & {
  _: {
    hasDefault: true;
  };
};

export type IsRequired<T extends DTypeBase> = T & {
  _: {
    required: true;
  };
};

export type RequiredKey<TKey extends string, T extends DType> =
  T extends IsRequired<T> ? TKey : never;

export type OptionalKey<TKey extends string, T extends DType> =
  T extends IsRequired<T> ? never : TKey;

export interface DType<
  T extends WithType<DTypeBaseConfig> = WithType<DTypeBaseConfig>,
> extends DTypeBase<T> {
  $defaultFn: T extends { hasDefault: true } ? () => T["$type"] : undefined;
  required: () => IsRequired<DType<T>>;
  transient: () => IsTransient<DType<T>>;
  default: (fn: () => T["$type"]) => HasDefault<DType<T>>;
}

export type GetDType<T extends WithType<DTypeBaseConfig>> = T["$type"];
export type GetConfig<T extends DTypeBase> = T["_"];

type TypeDType<U extends DTypeBaseConfig, T> = DType<
  U & {
    $type: T;
  }
>;

export const dtypeFactory = <T, U extends DTypeBaseConfig = DTypeBaseConfig>(
  factoryConfig?: Partial<U>,
  factoryOptions?: Partial<TypeDType<U, T>>
) => {
  interface DTypeConfig extends DTypeBaseConfig {
    $type: T;
  }
  const dtype = <U extends DTypeBaseConfig = DTypeBaseConfig>(
    config?: Partial<U>,
    options?: Partial<TypeDType<U, T>>
  ): Simplify<DType<DTypeConfig>> => {
    return {
      _: {
        $type: undefined as unknown as T,
        transient: false,
        hasDefault: false,
        required: false,
        ...factoryConfig,
        ...config,
      },
      $defaultFn: options?.$defaultFn ?? factoryOptions?.$defaultFn,
      required: () =>
        dtype({ ...factoryConfig, required: true }) as IsRequired<
          DType<DTypeConfig>
        >,
      transient: () =>
        dtype({ ...factoryConfig, transient: true }) as IsTransient<
          DType<DTypeConfig>
        >,
      default: (fn: () => T) =>
        dtype(
          { ...factoryConfig, hasDefault: true },
          { $defaultFn: fn }
        ) as HasDefault<DType<DTypeConfig>>,
    };
  };
  return dtype;
};

export const text = dtypeFactory<string>();
export const number = dtypeFactory<number>();
export const uuid = dtypeFactory<string, HasDefaultConfig<DTypeBaseConfig>>(
  { hasDefault: true },
  { $defaultFn: () => uuidv4() }
);
