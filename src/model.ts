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
  values: (values: Partial<TSchema["$infer"]>) => UpdateValues<TSchema>;
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
  getValues: () => TSchema["$infer"][],
  filterFn: (value: TSchema["$infer"]) => boolean,
  setFn: (values: TSchema["$infer"][]) => void,
  updateFn: (
    getValues: () => TSchema["$infer"][],
    filterFn: (value: TSchema["$infer"]) => boolean,
    setFn: (values: TSchema["$infer"][]) => void,
    value: Partial<TSchema["$infer"]>
  ) => TSchema["$infer"][]
): Update<TSchema> => {
  return {
    where: (condition) => {
      const values = getValues();
      const getFilteredValues = () => values.filter(condition);
      return createUpdate(
        getFilteredValues,
        condition,
        setFn,
        (getFilteredValues, condition, setFn, value) =>
          updateFn(getFilteredValues, condition, setFn, value)
      );
    },
    values: (values) => {
      const updatedValues = updateFn(getValues, filterFn, setFn, values);
      return {
        returning: () => {
          return updatedValues;
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
    update: (schema) => {
      const updateFn = (
        getValues: () => (typeof schema)["$infer"][],
        filterFn: (value: (typeof schema)["$infer"]) => boolean,
        setFn: (values: (typeof schema)["$infer"][]) => void,
        values: Partial<(typeof schema)["$infer"]>
      ) => {
        const allValues = getValues();
        const filteredValues = allValues.filter(filterFn);
        const rest = allValues.filter((value) => !filterFn(value));
        const updatedValues = filteredValues.map((value) => {
          return {
            ...value,
            ...values,
          };
        });
        setFn([...rest, ...updatedValues]);
        return updatedValues;
      };
      return createUpdate(
        () => JSON.parse(localStorage.getItem(schema._.name) ?? "[]"),
        () => true,
        (values) => {
          localStorage.setItem(schema._.name, JSON.stringify(values));
        },
        updateFn
      );
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
    update: (schema) => {
      const updateFn = (
        getValues: () => (typeof schema)["$infer"][],
        filterFn: (value: (typeof schema)["$infer"]) => boolean,
        setFn: (values: (typeof schema)["$infer"][]) => void,
        values: Partial<(typeof schema)["$infer"]>
      ) => {
        const allValues = getValues();
        const filteredValues = allValues.filter(filterFn);
        const rest = allValues.filter((value) => !filterFn(value));
        const updatedValues = filteredValues.map((value) => {
          return {
            ...value,
            ...values,
          };
        });
        setFn([...rest, ...updatedValues]);
        return updatedValues;
      };
      return createUpdate(
        () => JSON.parse(sessionStorage.getItem(schema._.name) ?? "[]"),
        () => true,
        (values) => {
          sessionStorage.setItem(schema._.name, JSON.stringify(values));
        },
        updateFn
      );
    },
  };
};
