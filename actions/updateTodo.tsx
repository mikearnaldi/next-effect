"use server";

import { effectAction } from "@/services/Runtime";
import { TodoRepo, TodoStatus } from "@/services/TodoRepo";
import { Schema } from "@effect/schema";
import { Effect } from "effect";
import { revalidatePath } from "next/cache";

export const updateTodo = effectAction(
  Schema.number,
  TodoStatus
)((id, status) =>
  Effect.gen(function* ($) {
    const todos = yield* $(TodoRepo);
    yield* $(todos.updateTodo(id, status));
    revalidatePath("/");
  })
);
