"use client";

import { deleteTodo } from "@/actions/deleteTodo";
import { updateTodo } from "@/actions/updateTodo";
import { Todo } from "@/services/TodoRepo";
import { Schema } from "@effect/schema";
import { useEffect, useRef } from "react";

export const TodoRow = ({
  todo,
}: {
  todo: Schema.Schema.From<typeof Todo>;
}) => {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    ref.current?.reset();
  });
  const isCompleted = todo.status === "COMPLETED";
  return (
    <li className={isCompleted ? "completed" : ""} key={todo.id}>
      <div className="view">
        <input
          className="toggle"
          type="checkbox"
          checked={isCompleted}
          readOnly
          onClick={() =>
            updateTodo(todo.id, isCompleted ? "CREATED" : "COMPLETED")
          }
        />
        <label>{todo.title}</label>
        <button className="destroy" onClick={() => deleteTodo(todo.id)} />
      </div>
    </li>
  );
};
