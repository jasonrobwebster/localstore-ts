import type { DType, GetConfig, GetDType } from "./dtype";
import type { OptionalKey, RequiredKey } from "./operations";
import type { Simplify } from "./utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SchemaConfig<TColumn extends DType = DType<any>> = Record<
  string,
  TColumn
>;

export interface Schema<T extends SchemaConfig = SchemaConfig> {
  readonly _: {
    columns: T;
    name: string;
  };
  getDefault: () => InferGet<Schema<T>>;
  $inferSet: InferSetSchema<Schema<T>>;
  $inferGet: InferGetSchema<Schema<T>>;
}

export type InferDTypes<
  TColumns extends Record<string, DType>,
  TMode extends "get" | "set" = "set",
> = Simplify<
  {
    [Key in keyof TColumns & string as RequiredKey<
      Key,
      TColumns[Key],
      TMode
    >]: GetDType<GetConfig<TColumns[Key]>>;
  } & {
    [Key in keyof TColumns & string as OptionalKey<
      Key,
      TColumns[Key],
      TMode
    >]?: GetDType<GetConfig<TColumns[Key]>>;
  }
>;

export type InferSetSchema<T extends Schema> = InferDTypes<
  T["_"]["columns"],
  "set"
>;
export type InferGetSchema<T extends Schema> = InferDTypes<
  T["_"]["columns"],
  "get"
>;

export type InferSet<T extends Schema> = T["$inferSet"];
export type InferGet<T extends Schema> = T["$inferGet"];

export const createSchema = <T extends SchemaConfig>(
  name: string,
  dtypes: T
): Schema<T> => {
  const $inferSet = undefined as unknown as InferSetSchema<Schema<T>>;
  const $inferGet = undefined as unknown as InferGetSchema<Schema<T>>;
  const getDefault = () => {
    const $default: InferGet<Schema<T>> = {} as InferGet<Schema<T>>;
    for (const key in dtypes) {
      const dtype = dtypes[key];
      if (dtype._.$defaultFn) {
        Object.assign($default, { [key]: dtype._.$defaultFn() });
      }
    }
    return $default;
  };
  return {
    _: {
      columns: dtypes,
      name,
    },
    getDefault,
    $inferSet,
    $inferGet,
  };
};
