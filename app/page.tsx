import { AddTodoForm } from "@/components/AddTodoForm";
import { TodoRow } from "@/components/TodoRow";
import { effectComponent } from "@/services/Runtime";
import { TodoArray, TodoRepo } from "@/services/TodoRepo";
import { Schema } from "@effect/schema";
import { Effect } from "effect";

export default effectComponent(
  Effect.gen(function* ($) {
    const todoRepo = yield* $(TodoRepo);
    const todos = yield* $(
      Schema.encode(TodoArray)(yield* $(todoRepo.getAllTodos))
    );
    return (
      <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
        <h1>Todos</h1>
        <ul>
          {todos.map((todo) => (
            <TodoRow todo={todo} key={todo.id} />
          ))}
        </ul>
        <h2>Add New Todo</h2>
        <AddTodoForm />
      </div>
    );
  })
);
