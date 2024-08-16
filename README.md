# localStore

A typesafe api for interacting with local and session storage. Inspired by [drizzle](https://orm.drizzle.team/).

## Installing

Run

```bash
npm install localStore
```

## Usage

The core of `localStore` lies in defining schemas. These are definitions of the underlying data that will be entered/retrieved from `localStorage` or `sessionStrorage`. You define a `schema` using type objects provided in `localStore/dtypes`:

```ts
// ./schema/local.ts
import { date, number, text } from "localStore/dtype";
import { createSchema } from "localStore/schema";

export const users = createSchema("users", {
  id: number().required(),
  age: number().default(() => 20),
  createdAt: date().default(() => new Date()),
  name: text(),
});
```

You then define a _model_ from the schemas. In this case, we define a `localStorage` model called `localStore`:

```ts
// ./store
import { createLocalStoreModel } from "~/model";
import * as localSchema from "./schema/local";

export const localStore = createLocalStoreModel(localSchema);
```

You can use your typesafe `localStorage` api as such

```ts
import { localStore } from "path/to/store";
import { users } from "path/to/schema";

localStore.set(users).values({ id: 1, name: "John" });
localStore.get(users); // [{ id: 1, age: 20, createdAt: new Date(), name: "John" }]

localStore.insert(users).values({ id: 2, name: "Jane" });
localStore.get(users); // [{ id: 1, ..., name: "John" }, { id: 2, ..., name: "Jane" }]

localStore.update(users).value({ age: 30 });
localStore.get(users); // [{ id: 1, age: 30, ..., name: "John" }, { id: 2, age: 30, ..., name: "Jane" }]

localStore
  .update(users)
  .where((user) => user.id === 1)
  .value({ name: "Jason" });
localStore.get(users); // [{ id: 1, age: 30, ..., name: "Jason" }, { id: 2, age: 30, ..., name: "Jane" }]
```
