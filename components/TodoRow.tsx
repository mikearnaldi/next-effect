"use client";

import { deleteTodo } from "@/actions/deleteTodo";
import { Todo } from "@/services/TodoRepo";
import { Schema } from "@effect/schema";
import { useRef, useEffect } from "react";

export const TodoRow = ({
  todo,
}: {
  todo: Schema.Schema.From<typeof Todo>;
}) => {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    ref.current?.reset();
  });
  return (
    <li>
      <div style={{ display: "flex", gap: "0.5em" }}>
        <div>
          {todo.title} ({todo.createdAt})
        </div>
        <div>
          <form ref={ref} action={deleteTodo}>
            <input type="hidden" name="id" value={todo.id} />
            <button type="submit">Done</button>
          </form>
        </div>
      </div>
    </li>
  );
};
