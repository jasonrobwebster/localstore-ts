import { date, number, text } from "typedstore/dtype";
import { createSchema } from "typedstore/schema";

export const user = createSchema("users", {
  id: text().default(() => "default"),
  age: number()
    .required()
    .default(() => 20),
  createdAt: date().default(() => new Date()),
  name: text(),
});
