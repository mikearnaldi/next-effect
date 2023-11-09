"use server";

import { formData } from "@/lib/effect";
import { effectAction } from "@/services/Runtime";
import { TodoRepo } from "@/services/TodoRepo";
import { Schema } from "@effect/schema";
import { Effect } from "effect";
import { revalidatePath } from "next/cache";

export const createTodo = effectAction(
  formData(Schema.struct({ title: Schema.string }))
)(({ title }) =>
  Effect.gen(function* ($) {
    const todos = yield* $(TodoRepo);
    yield* $(todos.addTodo(title));
    revalidatePath("/");
  })
);
