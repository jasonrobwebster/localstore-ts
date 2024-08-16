import type { InferGet, InferSet, Schema } from "./schema";
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
  get: <TSchema extends Schema>(schema: TSchema) => InferGet<TSchema>[];
  set: <TSchema extends Schema>(schema: TSchema) => Insert<TSchema>;
  insert: <TSchema extends Schema>(schema: TSchema) => Insert<TSchema>;
  update: <TSchema extends Schema>(schema: TSchema) => Update<TSchema>;
  clear: <TSchema extends Schema>(schema: TSchema) => void;
  clearAll: () => void;
  $inferGet: InferModel<Model<T>>;
}

export type InferModel<T extends Model> = Simplify<{
  [Key in keyof T["_"]["schemas"]]: InferGet<T["_"]["schemas"][Key]>;
}>;

interface Insert<TSchema extends Schema> {
  values: (
    values: InferSet<TSchema> | InferSet<TSchema>[]
  ) => Inserted<TSchema>;
}

interface Inserted<TSchema extends Schema> {
  returning: () => InferGet<TSchema>[];
}

interface Update<TSchema extends Schema> {
  where: (condition: (value: InferSet<TSchema>) => boolean) => Update<TSchema>;
  value: (values: Partial<InferSet<TSchema>>) => Updated<TSchema>;
}

interface Updated<TSchema extends Schema> {
  returning: () => InferGet<TSchema>[];
}

const createInsert = <TSchema extends Schema>(
  insertFn: (
    values: InferSet<TSchema> | InferSet<TSchema>[]
  ) => InferGet<TSchema>[]
): Insert<TSchema> => {
  return {
    values: (values) => {
      const newValues = insertFn(values);
      return {
        returning: () => {
          return newValues;
        },
      };
    },
  };
};

const createUpdate = <TSchema extends Schema>(
  updateFn: (
    value: Partial<InferSet<TSchema>>,
    filterFn?: (value: InferSet<TSchema>) => boolean
  ) => InferGet<TSchema>[],
  filterFn?: (value: InferSet<TSchema>) => boolean
): Update<TSchema> => {
  return {
    where: (condition) => {
      const newFilterFn = (value: InferSet<TSchema>) =>
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
  store: U,
  schemas: T
): Model<T> => {
  const $infer = undefined as unknown as InferModel<Model<T>>;
  return {
    _: {
      schemas: schemas,
    },
    $inferGet: $infer,
    get: (schema) => {
      if (!store.getItem(schema._.name)) {
        return [];
      } else {
        return JSON.parse(store.getItem(schema._.name)!) as InferGet<
          typeof schema
        >[];
      }
    },
    set: (schema) => {
      const insertFn = <TSchema extends Schema>(
        values: InferSet<TSchema> | InferSet<TSchema>[]
      ) => {
        const arrValues = !Array.isArray(values) ? [values] : values;
        const $default = schema.getDefault();
        const valuesWithDefault = arrValues.map((value) => {
          return {
            ...$default,
            ...value,
          };
        });
        store.setItem(schema._.name, JSON.stringify(valuesWithDefault));
        return valuesWithDefault as InferGet<TSchema>[];
      };
      return createInsert(insertFn);
    },
    insert: (schema) => {
      const insertFn = <TSchema extends Schema>(
        values: InferSet<TSchema> | InferSet<TSchema>[]
      ) => {
        const arrValues = !Array.isArray(values) ? [values] : values;
        const $default = schema.getDefault();
        const valuesWithDefault = arrValues.map((value) => {
          return {
            ...$default,
            ...value,
          };
        });
        const existingValues = JSON.parse(store.getItem(schema._.name) ?? "[]");
        existingValues.push(...valuesWithDefault);
        store.setItem(schema._.name, JSON.stringify(existingValues));
        return valuesWithDefault as InferGet<TSchema>[];
      };
      return createInsert(insertFn);
    },
    update: (schema) => {
      const updateFn = (
        value: Partial<InferSet<typeof schema>>,
        filterFn?: (value: InferSet<typeof schema>) => boolean
      ) => {
        const allValues = JSON.parse(
          store.getItem(schema._.name) ?? "[]"
        ) as InferSet<typeof schema>[];
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
    clear: (schema) => {
      store.removeItem(schema._.name);
    },
    clearAll: () => {
      for (const schema of Object.values(schemas)) {
        store.removeItem(schema._.name);
      }
    },
  };
};

export const createLocalStoreModel = <T extends ModelConfig>(schemas: T) =>
  createStoreModel(localStorage, schemas);

export const createSessionStoreModel = <T extends ModelConfig>(schemas: T) =>
  createStoreModel(sessionStorage, schemas);
