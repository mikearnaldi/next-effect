"use client";

import { createTodo } from "@/actions/createTodo";
import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";

export const AddTodoForm = () => {
  const ref = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState(createTodo, "initial");
  const { pending } = useFormStatus();
  useEffect(() => {
    if (!pending && state !== "initial") {
      ref.current?.reset();
    }
  });
  return (
    <form action={formAction} ref={ref}>
      <input
        className="new-todo"
        placeholder="What needs to be done?"
        autoFocus
        name="title"
      />
    </form>
  );
};
