import { describe, expect, expectTypeOf, it } from "vitest";
import { number, text } from "~/dtype";
import type { InferGetSchema } from "~/schema";
import { createSchema } from "~/schema";

describe("schema flow", () => {
  it("should create schema", () => {
    const users = createSchema("users", {
      age: number().required(),
    });
    expect(users).toBeDefined();
  });

  it("should infer schema", () => {
    const users = createSchema("users", {
      id: text(),
      age: number().required(),
    });

    type Users = (typeof users)["$inferSet"];

    expectTypeOf<InferGetSchema<typeof users>>().toEqualTypeOf<Users>();
    // @ts-expect-error: for some reason toBeString is complaining about no call signatures
    // but test passes regardless
    expectTypeOf(users.$inferSet).toHaveProperty("id").toBeString();
    expectTypeOf(users.$inferSet).toHaveProperty("age").toBeNumber();
  });

  it("should create a default value", () => {
    const users = createSchema("users", {
      id: text().default(() => "default"),
      age: number()
        .required()
        .default(() => 20),
      // check if .default.required is the same as .required.default
      reverseAge: number()
        .default(() => 30)
        .required(),
      name: text(),
    });

    const defaultUser = users.getDefault();
    expect(defaultUser.id).toBe("default");
    expect(defaultUser.age).toBe(20);
    expect(defaultUser.reverseAge).toBe(30);
    expect(defaultUser.name).toBeUndefined();
  });
});
