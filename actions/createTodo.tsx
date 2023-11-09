"use server";

import { formData } from "@/lib/effect";
import { effectAction } from "@/services/Runtime";
import { TodoRepo } from "@/services/TodoRepo";
import { Schema } from "@effect/schema";
import { Effect } from "effect";
import { revalidatePath } from "next/cache";

export const createTodo = effectAction(
  Schema.string,
  formData(Schema.struct({ title: Schema.string }))
)((_state, { title }) =>
  Effect.gen(function* ($) {
    const todos = yield* $(TodoRepo);
    if (title.length === 0) {
      return "invalid title";
    }
    yield* $(todos.addTodo(title));
    revalidatePath("/");
    return "ok";
  })
);
