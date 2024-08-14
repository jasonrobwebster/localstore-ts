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
  getDefault: () => InferSchema<Schema<T>>;
  $infer: InferSchema<Schema<T>>;
}

export type InferDTypes<TColumns extends Record<string, DType>> = Simplify<
  {
    [Key in keyof TColumns & string as RequiredKey<
      Key,
      TColumns[Key]
    >]: GetDType<GetConfig<TColumns[Key]>>;
  } & {
    [Key in keyof TColumns & string as OptionalKey<
      Key,
      TColumns[Key]
    >]?: GetDType<GetConfig<TColumns[Key]>>;
  }
>;

export type InferSchema<T extends Schema> = InferDTypes<T["_"]["columns"]>;

export const createSchema = <T extends SchemaConfig>(
  name: string,
  dtypes: T
): Schema<T> => {
  const $infer = undefined as unknown as InferSchema<Schema<T>>;
  const getDefault = () => {
    const $default: InferSchema<Schema<T>> = {} as InferSchema<Schema<T>>;
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
    $infer,
  };
};
