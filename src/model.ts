import type { Schema } from "./schema";
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
  get: <TSchema extends Schema>(schema: TSchema) => TSchema["$infer"][];
  set: <TSchema extends Schema>(
    schema: TSchema,
    value: TSchema["$infer"] | TSchema["$infer"][]
  ) => Insert<TSchema>;
  insert: <TSchema extends Schema>(schema: TSchema) => Insert<TSchema>;
  $infer: InferModel<Model<T>>;
}

export interface Insert<TSchema extends Schema> {
  values: (values: TSchema["$infer"]) => InsertValues<TSchema>;
}

export interface InsertValues<TSchema extends Schema> {
  returning: () => TSchema["$infer"];
}

export type InferSchema<TSchema extends Schema> = TSchema["$infer"];

export type InferModel<T extends Model> = Simplify<{
  [Key in keyof T["_"]["schemas"]]: InferSchema<T["_"]["schemas"][Key]>;
}>;

export const createInsert = <TSchema extends Schema>(
  insertFn: (values: TSchema["$infer"]) => void
): Insert<TSchema> => {
  return {
    values: (values) => {
      insertFn(values);
      return {
        returning: () => {
          return values as TSchema["$infer"];
        },
      };
    },
  };
};

export const createLocalStoreModel = <T extends ModelConfig>(
  config: T
): Model<T> => {
  const $infer = undefined as unknown as InferModel<Model<T>>;
  return {
    _: {
      schemas: config,
    },
    $infer,
    get: (schema) => {
      if (!localStorage.getItem(schema._.name)) {
        return [];
      } else {
        return JSON.parse(
          localStorage.getItem(schema._.name)!
        ) as (typeof schema)["$infer"][];
      }
    },
    set: (schema) => {
      const insertFn = <TSchema extends T[string]>(
        values: TSchema["$infer"] | TSchema["$infer"][]
      ) => {
        if (!Array.isArray(values)) {
          values = [values];
        }
        localStorage.setItem(schema._.name, JSON.stringify(values));
      };
      return createInsert(insertFn);
    },
    insert: (schema) => {
      const insertFn = <TSchema extends T[string]>(
        values: TSchema["$infer"] | TSchema["$infer"][]
      ) => {
        if (!Array.isArray(values)) {
          values = [values];
        }
        const existingValues = JSON.parse(
          localStorage.getItem(schema._.name) ?? "[]"
        );
        existingValues.push(values);
        localStorage.setItem(schema._.name, JSON.stringify(existingValues));
      };
      return createInsert(insertFn);
    },
  };
};

export const createSessionStoreModel = <T extends ModelConfig>(
  config: T
): Model<T> => {
  const $infer = undefined as unknown as InferModel<Model<T>>;
  return {
    _: {
      schemas: config,
    },
    $infer,
    get: (schema) => {
      if (!sessionStorage.getItem(schema._.name)) {
        return [];
      } else {
        return JSON.parse(
          sessionStorage.getItem(schema._.name)!
        ) as (typeof schema)["$infer"][];
      }
    },
    set: (schema) => {
      const insertFn = <TSchema extends T[string]>(
        values: TSchema["$infer"] | TSchema["$infer"][]
      ) => {
        const arrValues = !Array.isArray(values) ? [values] : values;
        sessionStorage.setItem(schema._.name, JSON.stringify(arrValues));
      };
      return createInsert(insertFn);
    },
    insert: (schema) => {
      const insertFn = <TSchema extends T[string]>(
        values: TSchema["$infer"] | TSchema["$infer"][]
      ) => {
        const arrValues = !Array.isArray(values) ? [values] : values;
        const existingValues = JSON.parse(
          sessionStorage.getItem(schema._.name) ?? "[]"
        ) as TSchema["$infer"][];
        existingValues.push(arrValues);
        sessionStorage.setItem(schema._.name, JSON.stringify(existingValues));
      };
      return createInsert(insertFn);
    },
  };
};
