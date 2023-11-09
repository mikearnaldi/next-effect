import { Schema } from "@effect/schema";
import {
  Context,
  Data,
  Duration,
  Effect,
  Layer,
  Metric,
  Schedule,
} from "effect";
import { Sql, SqlLive } from "./Sql";

//
// Data Model
//

export const TodoStatus = Schema.literal("COMPLETED", "CREATED");

export class Todo extends Schema.Class<Todo>()({
  id: Schema.number,
  title: Schema.string,
  status: TodoStatus,
  createdAt: Schema.dateFromString(Schema.string),
  updatedAt: Schema.dateFromString(Schema.string),
}) {}

export const TodoArray = Schema.array(Todo);

export class GetAllTodosError extends Data.TaggedError("GetAllTodosError")<{
  message: string;
}> {}

//
// Metrics
//

const getAllTodosErrorCount = Metric.counter("getAllTodosErrorCount");
const addTodoErrorCount = Metric.counter("addTodoErrorCount");
const deleteTodoErrorCount = Metric.counter("deleteTodoErrorCount");
const completeTodoErrorCount = Metric.counter("completeTodoErrorCount");

//
// Service Definition
//

export interface TodoRepo {
  readonly _: unique symbol;
}

export const TodoRepo = Context.Tag<
  TodoRepo,
  Effect.Effect.Success<typeof makeTodoRepo>
>("@context/Todos");

//
// Service Implementation
//

export const makeTodoRepo = Effect.gen(function* ($) {
  const sql = yield* $(Sql);

  const addTodo = (title: string) =>
    Effect.gen(function* ($) {
      const rows = yield* $(
        Effect.orDie(
          sql`INSERT INTO todos ${sql.insert([{ title }])} RETURNING *`
        ),
        Effect.withSpan("addTodoToDb")
      );
      const [todo] = yield* $(
        Effect.orDie(Schema.parse(Schema.tuple(Todo))(rows)),
        Effect.withSpan("parseResponse")
      );
      return todo;
    }).pipe(
      sql.withTransaction,
      Metric.trackErrorWith(addTodoErrorCount, () => 1),
      Effect.withSpan("addTodo")
    );

  const deleteTodo = (id: number) =>
    Effect.gen(function* ($) {
      yield* $(
        Effect.orDie(sql`DELETE FROM todos WHERE id = ${id}`),
        Effect.withSpan("deleteFromDb")
      );
    }).pipe(
      sql.withTransaction,
      Metric.trackErrorWith(deleteTodoErrorCount, () => 1),
      Effect.withSpan("deleteTodo")
    );

  const updateTodo = (id: number, status: Todo["status"]) =>
    Effect.gen(function* ($) {
      yield* $(
        Effect.orDie(sql`UPDATE todos SET status = ${status} WHERE id = ${id}`),
        Effect.withSpan("completeFromDb")
      );
    }).pipe(
      sql.withTransaction,
      Metric.trackErrorWith(completeTodoErrorCount, () => 1),
      Effect.withSpan("completeTodo")
    );

  const getAllTodos = Effect.gen(function* ($) {
    const rows = yield* $(
      Effect.orDie(sql`SELECT * from todos;`),
      Effect.withSpan("getFromDb")
    );
    const todos = yield* $(
      Effect.orDie(Schema.parse(TodoArray)(rows)),
      Effect.withSpan("parseTodos")
    );
    return todos;
  }).pipe(
    Metric.trackErrorWith(getAllTodosErrorCount, () => 1),
    Effect.withSpan("getAllTodos")
  );

  return {
    getAllTodos,
    addTodo,
    deleteTodo,
    updateTodo,
  };
});

export const TodoRepoLive = Layer.provide(
  SqlLive,
  Layer.effect(TodoRepo, makeTodoRepo)
);
