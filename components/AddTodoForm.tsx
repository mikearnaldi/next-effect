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
      <input type="text" size={50} name="title" />
      <button type="submit">Create Todo</button>
    </form>
  );
};
