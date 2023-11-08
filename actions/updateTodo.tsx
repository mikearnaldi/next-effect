"use server";

import { effectAction } from "@/services/Runtime";
import { Todo, TodoRepo } from "@/services/TodoRepo";
import { Effect } from "effect";
import { revalidatePath } from "next/cache";

export const updateTodo = effectAction((id: number, status: Todo["status"]) =>
  Effect.gen(function* ($) {
    const todos = yield* $(TodoRepo);
    yield* $(todos.updateTodo(id, status));
    revalidatePath("/");
  })
);
