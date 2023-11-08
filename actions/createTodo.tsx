"use server";

import { getFormData } from "@/lib/effect";
import { effectAction } from "@/services/Runtime";
import { TodoRepo } from "@/services/TodoRepo";
import { Schema } from "@effect/schema";
import { Effect } from "effect";
import { revalidatePath } from "next/cache";

export const createTodo = effectAction(() =>
  Effect.gen(function* ($) {
    const todos = yield* $(TodoRepo);
    const { title } = yield* $(
      getFormData(Schema.struct({ title: Schema.string }))
    );
    yield* $(todos.addTodo(title));
    revalidatePath("/");
  })
);
