"use server";

import { effectAction } from "@/services/Runtime";
import { TodoRepo } from "@/services/TodoRepo";
import { Effect } from "effect";
import { revalidatePath } from "next/cache";

export const deleteTodo = effectAction((id: number) =>
  Effect.gen(function* ($) {
    const todos = yield* $(TodoRepo);
    yield* $(todos.deleteTodo(id));
    revalidatePath("/");
  })
);
