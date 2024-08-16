import { date, number, text } from "localStore/dtype";
import { createSchema } from "localStore/schema";

export const user = createSchema("users", {
  id: text().default(() => "default"),
  age: number()
    .required()
    .default(() => 20),
  createdAt: date().default(() => new Date()),
  name: text(),
});
