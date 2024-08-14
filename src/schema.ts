import type {
  DType,
  GetConfig,
  GetDType,
  OptionalKey,
  RequiredKey,
} from "./dtype";
import type { Simplify } from "./utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface SchemaConfig<TColumn extends DType = DType<any>> {
  columns: Record<string, TColumn>;
}

export interface Schema<T extends SchemaConfig = SchemaConfig> {
  readonly _: {
    columns: T["columns"];
    name: string;
  };
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
  config: T
): Schema<T> => {
  const $infer = undefined as unknown as InferSchema<Schema<T>>;
  return {
    _: {
      columns: config.columns,
      name: name,
    },
    $infer,
  };
};
