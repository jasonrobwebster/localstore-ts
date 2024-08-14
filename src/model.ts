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
  update: <TSchema extends Schema>(schema: TSchema) => Update<TSchema>;
  $infer: InferModel<Model<T>>;
}

export type InferSchema<TSchema extends Schema> = TSchema["$infer"];

export type InferModel<T extends Model> = Simplify<{
  [Key in keyof T["_"]["schemas"]]: InferSchema<T["_"]["schemas"][Key]>;
}>;

interface Insert<TSchema extends Schema> {
  values: (
    values: TSchema["$infer"] | TSchema["$infer"][]
  ) => InsertValues<TSchema>;
}

interface InsertValues<TSchema extends Schema> {
  returning: () => TSchema["$infer"][];
}

interface Update<TSchema extends Schema> {
  where: (condition: (value: TSchema["$infer"]) => boolean) => Update<TSchema>;
  value: (values: Partial<TSchema["$infer"]>) => UpdateValues<TSchema>;
}

interface UpdateValues<TSchema extends Schema> {
  returning: () => TSchema["$infer"][];
}

const createInsert = <TSchema extends Schema>(
  insertFn: (values: TSchema["$infer"] | TSchema["$infer"][]) => void
): Insert<TSchema> => {
  return {
    values: (values) => {
      insertFn(values);
      return {
        returning: () => {
          const arrValues = !Array.isArray(values) ? [values] : values;
          return arrValues as TSchema["$infer"][];
        },
      };
    },
  };
};

const createUpdate = <TSchema extends Schema>(
  updateFn: (
    value: Partial<TSchema["$infer"]>,
    filterFn?: (value: TSchema["$infer"]) => boolean
  ) => TSchema["$infer"][],
  filterFn?: (value: TSchema["$infer"]) => boolean
): Update<TSchema> => {
  return {
    where: (condition) => {
      const newFilterFn = (value: TSchema["$infer"]) =>
        (filterFn?.(value) ?? true) && condition(value);
      return createUpdate(updateFn, newFilterFn);
    },
    value: (value) => {
      const updatedValues = updateFn(value, filterFn);
      return {
        returning: () => {
          return updatedValues;
        },
      };
    },
  };
};

export const createStoreModel = <
  T extends ModelConfig,
  U extends Storage = Storage,
>(
  config: T,
  store: U
): Model<T> => {
  const $infer = undefined as unknown as InferModel<Model<T>>;
  return {
    _: {
      schemas: config,
    },
    $infer,
    get: (schema) => {
      if (!store.getItem(schema._.name)) {
        return [];
      } else {
        return JSON.parse(
          store.getItem(schema._.name)!
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
        store.setItem(schema._.name, JSON.stringify(values));
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
        const existingValues = JSON.parse(store.getItem(schema._.name) ?? "[]");
        existingValues.push(values);
        store.setItem(schema._.name, JSON.stringify(existingValues));
      };
      return createInsert(insertFn);
    },
    update: (schema) => {
      const updateFn = (
        value: Partial<(typeof schema)["$infer"]>,
        filterFn?: (value: (typeof schema)["$infer"]) => boolean
      ) => {
        const allValues = JSON.parse(
          store.getItem(schema._.name) ?? "[]"
        ) as (typeof schema)["$infer"][];
        let filteredValues = allValues;
        if (filterFn) {
          filteredValues = allValues.filter(filterFn);
        }
        const rest = allValues.filter((value) => !(filterFn?.(value) ?? true));
        const updatedValues = filteredValues.map((oldValue) => {
          return {
            ...oldValue,
            ...value,
          };
        });
        store.setItem(
          schema._.name,
          JSON.stringify([...rest, ...updatedValues])
        );
        return updatedValues;
      };
      return createUpdate(updateFn);
    },
  };
};

export const createLocalStoreModel = <T extends ModelConfig>(config: T) =>
  createStoreModel(config, localStorage);

export const createSessionStoreModel = <T extends ModelConfig>(config: T) =>
  createStoreModel(config, sessionStorage);
