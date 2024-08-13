import { Simplify } from "./utils";
import { v4 as uuidv4 } from "uuid";

export interface DTypeBaseConfig<HasDefault extends boolean = boolean> {
  readonly transient: boolean;
  readonly hasDefault: HasDefault;
}

export interface TypedDTypeBaseConfig<HasDefault extends boolean = boolean>
  extends DTypeBaseConfig<HasDefault> {
  readonly $type: unknown;
}

export interface DTypeBase<
  T extends TypedDTypeBaseConfig = TypedDTypeBaseConfig,
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

export interface DType<T extends TypedDTypeBaseConfig = TypedDTypeBaseConfig>
  extends DTypeBase<T> {
  $defaultFn: T extends { hasDefault: true } ? () => T["$type"] : undefined;
  transient: () => IsTransient<DType<T>>;
  default: (fn: () => T["$type"]) => HasDefault<DType<T>>;
}

export type GetDType<T extends TypedDTypeBaseConfig> = T["$type"];
export type GetConfig<T extends DTypeBase> = T["_"];

export const dtypeFactory = <T, U extends DTypeBaseConfig = DTypeBaseConfig>(
  config?: Partial<U>,
  options?: Partial<DType<U & { $type: T }>>
) => {
  interface DTypeConfig extends DTypeBaseConfig {
    $type: T;
  }
  return (): Simplify<DType<DTypeConfig>> => {
    return {
      _: {
        $type: undefined as unknown as T,
        transient: false,
        hasDefault: false,
        ...config,
      },
      $defaultFn: options?.$defaultFn,
      transient: () =>
        dtypeFactory<T>({ ...config, transient: true })() as IsTransient<
          DType<DTypeConfig>
        >,
      default: (fn: () => T) =>
        dtypeFactory<T, TypedDTypeBaseConfig<true>>(
          { ...config, hasDefault: true },
          { $defaultFn: fn }
        )() as HasDefault<DType<DTypeConfig>>,
    };
  };
};

export const text = dtypeFactory<string>();
export const number = dtypeFactory<number>();
export const uuid = dtypeFactory<string, TypedDTypeBaseConfig<true>>(
  { hasDefault: true },
  { $defaultFn: () => uuidv4() }
);
