"use client";

import { createTodo } from "@/actions/createTodo";
import { useEffect, useRef } from "react";

export const AddTodoForm = () => {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    ref.current?.reset();
  });
  return (
    <form action={createTodo} ref={ref}>
      <input
        className="new-todo"
        placeholder="What needs to be done?"
        autoFocus
        name="title"
      />
    </form>
  );
};
