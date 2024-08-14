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

export type WithType<T extends DTypeBaseConfig, U = unknown> = T & {
  readonly $type: U;
  readonly $defaultFn?: () => U;
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
    $defaultFn: () => T["_"]["$type"];
  };
};

export type IsRequired<T extends DTypeBase> = T & {
  _: {
    required: true;
  };
};

export interface DType<
  T extends WithType<DTypeBaseConfig> = WithType<DTypeBaseConfig>,
> extends DTypeBase<T> {
  required: () => IsRequired<this>;
  transient: () => IsTransient<this>;
  default: (fn: () => T["$type"]) => HasDefault<this>;
}

export type GetDType<T extends WithType<DTypeBaseConfig>> = T["$type"];
export type GetConfig<T extends DTypeBase> = T["_"];

export const dtypeFactory = <
  T,
  TFactoryConfig extends DTypeBaseConfig = DTypeBaseConfig,
>(
  factoryConfig?: Partial<TFactoryConfig>
) => {
  type DTypeConfig = WithType<DTypeBaseConfig, T>;

  const dtype = <TConfigBase extends DTypeConfig = DTypeConfig>(
    config?: Partial<TConfigBase>
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
      required: () =>
        dtype({ ...factoryConfig, ...config, required: true }) as IsRequired<
          DType<DTypeConfig>
        >,
      transient: () =>
        dtype({ ...factoryConfig, ...config, transient: true }) as IsTransient<
          DType<DTypeConfig>
        >,
      default: (fn: () => T) =>
        dtype({
          ...factoryConfig,
          ...config,
          hasDefault: true,
          $defaultFn: fn,
        }) as HasDefault<DType<DTypeConfig>>,
    };
  };
  return dtype;
};

export const text = dtypeFactory<string>();
export const number = dtypeFactory<number>();
export const uuid = () => dtypeFactory<string>()().default(() => uuidv4());
