"use server";

import { effectAction } from "@/services/Runtime";
import { TodoRepo } from "@/services/TodoRepo";
import { Schema } from "@effect/schema";
import { Effect } from "effect";
import { revalidatePath } from "next/cache";

export const deleteTodo = effectAction((formData: FormData) =>
  Effect.gen(function* ($) {
    const todos = yield* $(TodoRepo);
    const { id } = yield* $(
      Schema.parse(
        Schema.struct({
          id: Schema.numberFromString(Schema.string),
        })
      )(Object.fromEntries(formData))
    );
    yield* $(todos.deleteTodo(id));
    revalidatePath("/");
  })
);
