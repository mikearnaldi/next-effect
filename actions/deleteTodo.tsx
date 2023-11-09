"use server";

import { effectAction } from "@/services/Runtime";
import { TodoRepo } from "@/services/TodoRepo";
import { Schema } from "@effect/schema";
import { Effect } from "effect";
import { revalidatePath } from "next/cache";

export const deleteTodo = effectAction(Schema.number)((id) =>
  Effect.gen(function* ($) {
    const todos = yield* $(TodoRepo);
    yield* $(todos.deleteTodo(id));
    revalidatePath("/");
  })
);
