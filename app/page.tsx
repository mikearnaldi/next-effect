import { AddTodoForm } from "@/components/AddTodoForm";
import { TodoRow } from "@/components/TodoRow";
import { effectComponent } from "@/services/Runtime";
import { TodoArray, TodoRepo } from "@/services/TodoRepo";
import { Schema } from "@effect/schema";
import { Effect } from "effect";

const getAllTodos = Effect.gen(function* ($) {
  const todoRepo = yield* $(TodoRepo);
  const todos = yield* $(todoRepo.getAllTodos);
  return yield* $(Schema.encode(TodoArray)(todos));
});

export default effectComponent(
  Effect.gen(function* ($) {
    const todos = yield* $(getAllTodos);
    return (
      <section className="todoapp">
        <header className="header">
          <h1>todos</h1>
          <AddTodoForm />
        </header>
        <section className="main">
          <input id="toggle-all" className="toggle-all" type="checkbox" />
          <label htmlFor="toggle-all">Mark all as complete</label>
          <ul className="todo-list">
            {todos.map((todo) => (
              <TodoRow todo={todo} key={todo.id} />
            ))}
          </ul>
        </section>
      </section>
    );
  }).pipe(Effect.withSpan("indexPage"))
);
