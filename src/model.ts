import { type Schema } from "./schema";
import type { Simplify } from "./utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ModelConfig<TSchema extends Schema = Schema<any>> = Record<
  string,
  TSchema
>;

export interface Model<T extends ModelConfig = ModelConfig> {
  readonly _: {
    schemas: T;
  };
  $infer: InferModel<Model<T>>;
}

export type InferSchema<TSchema extends Schema> = TSchema["$infer"];

export type InferModel<T extends Model> = Simplify<{
  [Key in keyof T["_"]["schemas"]]: InferSchema<T["_"]["schemas"][Key]>;
}>;

export const createModel = <T extends ModelConfig>(config: T): Model<T> => {
  const $infer = undefined as unknown as InferModel<Model<T>>;
  return {
    _: {
      schemas: config,
    },
    $infer,
  };
};
