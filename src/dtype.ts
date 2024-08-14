import { Simplify } from "./utils";
import { v4 as uuidv4 } from "uuid";

export interface DTypeBaseConfig {
  readonly transient: boolean;
  readonly hasDefault: boolean;
}

export type HasDefaultConfig<T extends DTypeBaseConfig> = T & {
  readonly hasDefault: true;
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

export interface DType<
  T extends WithType<DTypeBaseConfig> = WithType<DTypeBaseConfig>,
> extends DTypeBase<T> {
  $defaultFn: T extends { hasDefault: true } ? () => T["$type"] : undefined;
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
  config?: Partial<U>,
  options?: Partial<TypeDType<U, T>>
) => {
  interface DTypeConfig extends DTypeBaseConfig {
    $type: T;
  }
  const dtype = <U extends DTypeBaseConfig = DTypeBaseConfig>(
    dtypeConfig?: Partial<U>,
    dtypeOptions?: Partial<TypeDType<U, T>>
  ): Simplify<DType<DTypeConfig>> => {
    return {
      _: {
        $type: undefined as unknown as T,
        transient: false,
        hasDefault: false,
        ...config,
        ...dtypeConfig,
      },
      $defaultFn: dtypeOptions?.$defaultFn ?? options?.$defaultFn,
      transient: () =>
        dtype({ ...config, transient: true }) as IsTransient<
          DType<DTypeConfig>
        >,
      default: (fn: () => T) =>
        dtype(
          { ...config, hasDefault: true },
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
