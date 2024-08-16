import { beforeEach, describe, expect, it } from "vitest";
import { date, number, text } from "~/dtype";
import { createStoreModel } from "~/model";
import { createSchema } from "~/schema";

// mock local storage
let storage: Record<string, string> = {};

const mockStore: Storage = {
  length: 0,
  getItem: (key) => storage[key] ?? null,
  setItem: (key, value) => {
    storage[key] = value;
  },
  clear: () => {
    storage = {};
  },
  key: () => null,
  removeItem: (key) => {
    delete storage[key];
  },
};

describe("get flow", () => {
  beforeEach(() => {
    storage = {};
  });

  it("should get", () => {
    const now = new Date();

    const users = createSchema("users", {
      age: number().required(),
      createdAt: date().default(() => now),
    });

    const people = createSchema("people", {
      age: number().required(),
      createdAt: date(),
    });

    const store = createStoreModel(mockStore, {
      users,
      people,
    });

    store.insert(users).values({ age: 20 });
    expect(store.get(users).length).toBe(1);
    expect(store.get(users)[0].age).toBe(20);
    expect(store.get(users)[0].createdAt).toStrictEqual(now);

    store.insert(users).values({ age: 30 });
    expect(store.get(users).length).toBe(2);
    expect(store.get(users)[1].age).toBe(30);
    expect(store.get(users)[1].createdAt).toStrictEqual(now);

    store.clear(users);
    expect(store.get(users).length).toBe(0);

    store.insert(people).values({ age: 30 });
    expect(store.get(people).length).toBe(1);
    expect(store.get(people)[0].age).toBe(30);
    expect(store.get(people)[0].createdAt).toBeUndefined();
    expect(store.get(users).length).toBe(0);
  });
});

describe("insert flow", () => {
  beforeEach(() => {
    storage = {};
  });

  it("should insert", () => {
    const users = createSchema("users", {
      age: number().required(),
    });

    const store = createStoreModel(mockStore, {
      users,
    });

    store.insert(users).values({ age: 20 });
    expect(store.get(users).length).toBe(1);
    expect(store.get(users)[0].age).toBe(20);
  });

  it("should insert with default", () => {
    const users = createSchema("users", {
      id: text().default(() => "default"),
    });

    const store = createStoreModel(mockStore, {
      users,
    });

    store.insert(users).values({});
    expect(store.get(users).length).toBe(1);
    expect(store.get(users)[0].id).toBe("default");
  });

  it("should overwrite default", () => {
    const users = createSchema("users", {
      id: text().default(() => "default"),
    });

    const store = createStoreModel(mockStore, {
      users,
    });

    store.insert(users).values({ id: "1" });
    expect(store.get(users).length).toBe(1);
    expect(store.get(users)[0].id).toBe("1");
  });

  it("should insert multiple", () => {
    const users = createSchema("users", {
      age: number().required(),
    });

    const store = createStoreModel(mockStore, {
      users,
    });

    store.insert(users).values([{ age: 20 }, { age: 30 }]);
    expect(store.get(users).length).toBe(2);
    expect(store.get(users)[0].age).toBe(20);
    expect(store.get(users)[1].age).toBe(30);
  });

  it("should insert undefined values", () => {
    const users = createSchema("users", {
      age: number(),
    });

    const store = createStoreModel(mockStore, {
      users,
    });

    store.insert(users).values({ age: 20 });
    store.insert(users).values({});
    expect(store.get(users).length).toBe(2);
    expect(store.get(users)[0].age).toBe(20);
    expect(store.get(users)[1].age).toBeUndefined();
  });

  it("should insert with default and required", () => {
    const users = createSchema("users", {
      id: text()
        .default(() => "default")
        .required(),
      reverseId: text()
        .required()
        .default(() => "defaultReversed"),
    });

    const store = createStoreModel(mockStore, {
      users,
    });

    store.insert(users).values({});
    expect(store.get(users).length).toBe(1);
    expect(store.get(users)[0].id).toBe("default");
  });

  it("should insert with returning", () => {
    const users = createSchema("users", {
      age: number().required(),
    });

    const store = createStoreModel(mockStore, {
      users,
    });

    const updatedValues = store.insert(users).values({ age: 20 }).returning();
    expect(updatedValues.length).toBe(1);
    expect(updatedValues[0].age).toBe(20);
    expect(store.get(users).length).toBe(1);
    expect(store.get(users)[0].age).toBe(20);
  });
});

describe("set flow", () => {
  beforeEach(() => {
    storage = {};
  });

  it("should set", () => {
    const users = createSchema("users", {
      age: number().required(),
    });

    const store = createStoreModel(mockStore, {
      users,
    });

    store.set(users).values({ age: 20 });
    expect(store.get(users).length).toBe(1);
    expect(store.get(users)[0].age).toBe(20);
  });

  it("should set with default", () => {
    const users = createSchema("users", {
      id: text().default(() => "default"),
    });

    const store = createStoreModel(mockStore, {
      users,
    });

    store.set(users).values({});
    expect(store.get(users).length).toBe(1);
    expect(store.get(users)[0].id).toBe("default");
  });

  it("should overwrite default", () => {
    const users = createSchema("users", {
      id: text().default(() => "default"),
    });

    const store = createStoreModel(mockStore, {
      users,
    });

    store.set(users).values({ id: "1" });
    expect(store.get(users).length).toBe(1);
    expect(store.get(users)[0].id).toBe("1");
  });

  it("should set multiple values", () => {
    const users = createSchema("users", {
      age: number().required(),
    });

    const store = createStoreModel(mockStore, {
      users,
    });

    store.set(users).values([{ age: 20 }, { age: 30 }]);
    expect(store.get(users).length).toBe(2);
    expect(store.get(users)[0].age).toBe(20);
    expect(store.get(users)[1].age).toBe(30);
  });

  it("should set multiple values with default", () => {
    const users = createSchema("users", {
      age: number().required(),
      id: text().default(() => "default"),
    });

    const store = createStoreModel(mockStore, {
      users,
    });

    store.set(users).values([{ age: 20 }, { age: 30 }]);
    expect(store.get(users).length).toBe(2);
    expect(store.get(users)[0].age).toBe(20);
    expect(store.get(users)[0].id).toBe("default");
    expect(store.get(users)[1].age).toBe(30);
    expect(store.get(users)[1].id).toBe("default");
  });

  it("should set undefined values", () => {
    const users = createSchema("users", {
      age: number(),
    });

    const store = createStoreModel(mockStore, {
      users,
    });

    store.set(users).values({});
    expect(store.get(users).length).toBe(1);
    expect(store.get(users)[0].age).toBeUndefined();
  });

  it("should overwrite previous sets or inserts", () => {
    const users = createSchema("users", {
      age: number().required(),
    });

    const store = createStoreModel(mockStore, {
      users,
    });

    store.insert(users).values([{ age: 20 }, { age: 100 }]);
    expect(store.get(users).length).toBe(2);
    expect(store.get(users)[0].age).toBe(20);
    expect(store.get(users)[1].age).toBe(100);

    store.set(users).values({ age: 30 });
    expect(store.get(users).length).toBe(1);
    expect(store.get(users)[0].age).toBe(30);

    store.insert(users).values({ age: 40 });
    expect(store.get(users).length).toBe(2);
    expect(store.get(users)[0].age).toBe(30);
    expect(store.get(users)[1].age).toBe(40);

    store.set(users).values([{ age: 50 }, { age: 60 }]);
    expect(store.get(users).length).toBe(2);
    expect(store.get(users)[0].age).toBe(50);
    expect(store.get(users)[1].age).toBe(60);
  });

  it("should set with returning", () => {
    const users = createSchema("users", {
      age: number().required(),
    });

    const store = createStoreModel(mockStore, {
      users,
    });

    const updatedValues = store.set(users).values({ age: 20 }).returning();
    expect(updatedValues.length).toBe(1);
    expect(updatedValues[0].age).toBe(20);
    expect(store.get(users).length).toBe(1);
    expect(store.get(users)[0].age).toBe(20);
  });
});

describe("update flow", () => {
  beforeEach(() => {
    storage = {};
  });

  it("should update", () => {
    const users = createSchema("users", {
      age: number().required(),
    });

    const store = createStoreModel(mockStore, {
      users,
    });

    store.insert(users).values({ age: 20 });
    expect(store.get(users).length).toBe(1);
    expect(store.get(users)[0].age).toBe(20);

    store.update(users).value({ age: 30 });
    expect(store.get(users).length).toBe(1);
    expect(store.get(users)[0].age).toBe(30);
  });

  it("should update multiple", () => {
    const users = createSchema("users", {
      age: number().required(),
    });

    const store = createStoreModel(mockStore, {
      users,
    });

    store.insert(users).values([{ age: 20 }, { age: 30 }]);
    expect(store.get(users).length).toBe(2);
    expect(store.get(users)[0].age).toBe(20);
    expect(store.get(users)[1].age).toBe(30);

    store.update(users).value({ age: 50 });
    expect(store.get(users).length).toBe(2);
    expect(store.get(users)[0].age).toBe(50);
    expect(store.get(users)[1].age).toBe(50);
  });

  it("should filter by condition", () => {
    const users = createSchema("users", {
      id: number().required(),
      age: number().required(),
    });

    const store = createStoreModel(mockStore, {
      users,
    });

    store.insert(users).values([
      { id: 1, age: 20 },
      { id: 2, age: 30 },
    ]);
    expect(store.get(users).length).toBe(2);
    expect(store.get(users)[0].age).toBe(20);
    expect(store.get(users)[1].age).toBe(30);

    // updates currently mess with the order of the data
    // this is not unintentional, but it's a side effect of the current implementation
    store
      .update(users)
      .where((value) => value.id === 1)
      .value({ age: 50 });
    expect(store.get(users).length).toBe(2);
    expect(store.get(users).find((x) => x.id === 1)).toBeDefined();
    expect(store.get(users).find((x) => x.id === 1)!.age).toBe(50);
    expect(store.get(users).find((x) => x.id === 2)).toBeDefined();
    expect(store.get(users).find((x) => x.id === 2)!.age).toBe(30);
  });

  it("should filter by condition and return", () => {
    const users = createSchema("users", {
      id: number().required(),
      age: number().required(),
      name: text(),
    });

    const store = createStoreModel(mockStore, {
      users,
    });

    store.insert(users).values([
      { id: 1, age: 20 },
      { id: 2, age: 30 },
      { id: 3, age: 50 },
    ]);
    expect(store.get(users).length).toBe(3);
    expect(store.get(users)[0].age).toBe(20);
    expect(store.get(users)[1].age).toBe(30);

    const updatedValues = store
      .update(users)
      .where((value) => value.id === 1)
      .value({ age: 50, name: "Jason" })
      .returning();
    expect(updatedValues.length).toBe(1);
    expect(updatedValues[0].age).toBe(50);
    expect(store.get(users).length).toBe(3);
    expect(store.get(users).find((x) => x.id === 1)).toBeDefined();
    expect(store.get(users).find((x) => x.id === 1)!.age).toBe(50);
    expect(store.get(users).find((x) => x.id === 2)).toBeDefined();
    expect(store.get(users).find((x) => x.id === 2)!.age).toBe(30);
  });

  it("should update over multiple matching conditions", () => {
    const users = createSchema("users", {
      id: number().required(),
      age: number().required(),
    });

    const store = createStoreModel(mockStore, {
      users,
    });

    store.insert(users).values([
      { id: 1, age: 20 },
      { id: 2, age: 30 },
      { id: 3, age: 50 },
    ]);
    expect(store.get(users).length).toBe(3);
    expect(store.get(users)[0].age).toBe(20);
    expect(store.get(users)[1].age).toBe(30);
    expect(store.get(users)[2].age).toBe(50);

    store
      .update(users)
      .where((value) => value.age > 20)
      .value({ age: 40 });
    expect(store.get(users).length).toBe(3);
    expect(store.get(users).find((x) => x.id === 1)).toBeDefined();
    expect(store.get(users).find((x) => x.id === 1)!.age).toBe(20);
    expect(store.get(users).find((x) => x.id === 2)).toBeDefined();
    expect(store.get(users).find((x) => x.id === 2)!.age).toBe(40);
    expect(store.get(users).find((x) => x.id === 3)).toBeDefined();
    expect(store.get(users).find((x) => x.id === 3)!.age).toBe(40);
  });

  it("should update over multiple matching conditions and return", () => {
    const users = createSchema("users", {
      id: number().required(),
      age: number().required(),
    });

    const store = createStoreModel(mockStore, {
      users,
    });

    store.insert(users).values([
      { id: 1, age: 20 },
      { id: 2, age: 30 },
      { id: 3, age: 50 },
    ]);
    expect(store.get(users).length).toBe(3);
    expect(store.get(users)[0].age).toBe(20);
    expect(store.get(users)[1].age).toBe(30);
    expect(store.get(users)[2].age).toBe(50);

    const updatedValues = store
      .update(users)
      .where((value) => value.age > 20)
      .value({ age: 40 })
      .returning();
    expect(updatedValues.length).toBe(2);
    expect(updatedValues.find((x) => x.id === 2)!.age).toBe(40);
    expect(updatedValues.find((x) => x.id === 3)!.age).toBe(40);
    expect(store.get(users).length).toBe(3);
    expect(store.get(users).find((x) => x.id === 1)).toBeDefined();
    expect(store.get(users).find((x) => x.id === 1)!.age).toBe(20);
    expect(store.get(users).find((x) => x.id === 2)).toBeDefined();
    expect(store.get(users).find((x) => x.id === 2)!.age).toBe(40);
    expect(store.get(users).find((x) => x.id === 3)).toBeDefined();
    expect(store.get(users).find((x) => x.id === 3)!.age).toBe(40);
  });

  it("should update with multiple values", () => {
    const users = createSchema("users", {
      id: number().required(),
      age: number().required(),
      name: text(),
    });

    const store = createStoreModel(mockStore, {
      users,
    });

    store.insert(users).values([
      { id: 1, age: 20, name: "Jane" },
      { id: 2, age: 30, name: "John" },
      { id: 3, age: 50 },
    ]);
    expect(store.get(users).length).toBe(3);
    expect(store.get(users)[0].age).toBe(20);
    expect(store.get(users)[0].name).toBe("Jane");
    expect(store.get(users)[1].age).toBe(30);
    expect(store.get(users)[1].name).toBe("John");
    expect(store.get(users)[2].age).toBe(50);
    expect(store.get(users)[2].name).toBeUndefined();

    store
      .update(users)
      .where((value) => value.age > 20)
      .value({ age: 40, name: "Joanne" });
    expect(store.get(users).length).toBe(3);
    expect(store.get(users).find((x) => x.id === 1)).toBeDefined();
    expect(store.get(users).find((x) => x.id === 1)!.age).toBe(20);
    expect(store.get(users).find((x) => x.id === 1)!.name).toBe("Jane");
    expect(store.get(users).find((x) => x.id === 2)).toBeDefined();
    expect(store.get(users).find((x) => x.id === 2)!.age).toBe(40);
    expect(store.get(users).find((x) => x.id === 2)!.name).toBe("Joanne");
    expect(store.get(users).find((x) => x.id === 3)).toBeDefined();
    expect(store.get(users).find((x) => x.id === 3)!.age).toBe(40);
    expect(store.get(users).find((x) => x.id === 3)!.name).toBe("Joanne");
  });

  it("should chain conditions", () => {
    const users = createSchema("users", {
      id: number().required(),
      age: number().required(),
      name: text(),
    });

    const store = createStoreModel(mockStore, {
      users,
    });

    store.insert(users).values([
      { id: 1, age: 20, name: "Jane" },
      { id: 2, age: 30, name: "John" },
      { id: 3, age: 50 },
    ]);
    expect(store.get(users).length).toBe(3);
    expect(store.get(users)[0].age).toBe(20);
    expect(store.get(users)[0].name).toBe("Jane");
    expect(store.get(users)[1].age).toBe(30);
    expect(store.get(users)[1].name).toBe("John");
    expect(store.get(users)[2].age).toBe(50);
    expect(store.get(users)[2].name).toBeUndefined();

    store
      .update(users)
      .where((value) => value.age > 20)
      .where((value) => value.id !== 2)
      .value({ age: 40, name: "Joanne" });
    expect(store.get(users).length).toBe(3);
    expect(store.get(users).find((x) => x.id === 1)).toBeDefined();
    expect(store.get(users).find((x) => x.id === 1)!.age).toBe(20);
    expect(store.get(users).find((x) => x.id === 1)!.name).toBe("Jane");
    expect(store.get(users).find((x) => x.id === 2)).toBeDefined();
    expect(store.get(users).find((x) => x.id === 2)!.age).toBe(30);
    expect(store.get(users).find((x) => x.id === 2)!.name).toBe("John");
    expect(store.get(users).find((x) => x.id === 3)).toBeDefined();
    expect(store.get(users).find((x) => x.id === 3)!.age).toBe(40);
    expect(store.get(users).find((x) => x.id === 3)!.name).toBe("Joanne");
  });
});

describe("clear flow", () => {
  beforeEach(() => {
    storage = {};
  });

  it("should clear", () => {
    const users = createSchema("users", {
      age: number().required(),
    });

    const store = createStoreModel(mockStore, {
      users,
    });

    store.insert(users).values({ age: 20 });
    expect(store.get(users).length).toBe(1);
    store.clear(users);
    expect(store.get(users).length).toBe(0);
  });

  it("should clear with multiple schemas", () => {
    const users = createSchema("users", {
      age: number().required(),
    });

    const people = createSchema("people", {
      age: number().required(),
    });

    const store = createStoreModel(mockStore, {
      users,
      people,
    });

    store.insert(users).values({ age: 20 });
    store.insert(people).values({ age: 30 });
    expect(store.get(users).length).toBe(1);
    expect(store.get(people).length).toBe(1);
    store.clear(users);
    expect(store.get(users).length).toBe(0);
    expect(store.get(people).length).toBe(1);
  });

  it("should clear all", () => {
    const users = createSchema("users", {
      age: number().required(),
    });

    const people = createSchema("people", {
      age: number().required(),
    });

    const store = createStoreModel(mockStore, {
      users,
      people,
    });

    store.insert(users).values({ age: 20 });
    store.insert(people).values({ age: 30 });
    expect(store.get(users).length).toBe(1);
    expect(store.get(people).length).toBe(1);
    store.clearAll();
    expect(store.get(users).length).toBe(0);
    expect(store.get(people).length).toBe(0);
  });
});
