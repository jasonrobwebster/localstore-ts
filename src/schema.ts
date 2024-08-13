import { DType, GetConfig, GetDType } from "./dtype";
import { Simplify } from "./utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface SchemaConfig<TColumn extends DType = DType<any>> {
  columns: Record<string, TColumn>;
}

export interface Schema<T extends SchemaConfig = SchemaConfig> {
  readonly _: {
    columns: T["columns"];
    name: string;
  };
  $infer: InferModel<Schema<T>>;
}

export const createSchema = <T extends SchemaConfig>(
  name: string,
  config: T
): Schema<T> => {
  const $infer: InferModel<Schema<T>> = undefined as unknown as InferModel<
    Schema<T>
  >;
  return {
    _: {
      columns: config.columns,
      name: name,
    },
    $infer,
  };
};

export type InferDTypes<TColumns extends Record<string, DType>> = Simplify<{
  [Key in keyof TColumns]: GetDType<GetConfig<TColumns[Key]>>;
}>;

export type InferModel<T extends Schema> = InferDTypes<T["_"]["columns"]>;
