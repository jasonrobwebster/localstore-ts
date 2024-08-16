import { createLocalStoreModel } from "localstore/model";
import * as localSchema from "./schema/local";

export const localStore = createLocalStoreModel(localSchema);

/**
 * Usage:
 * import { user } from "/path/to/local/schema"
 *
 * localStore.set(user).values({ name: "John" })
 * localStore.get(user) // [{ id: "default", age: 20, createdAt: new Date(), name: "John" }]
 */
