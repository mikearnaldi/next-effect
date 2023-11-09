import { Layer } from "effect";
import { SqlLive } from "./Sql";
import { TracingLive } from "./Tracing";
import { nextRuntime } from "@/lib/effect";
import { globalValue } from "effect/GlobalValue";
import { TodoRepoLive } from "./TodoRepo";

const { childRuntime } = globalValue("@app/GlobalRuntime", () =>
  nextRuntime(SqlLive.pipe(Layer.useMerge(TracingLive)))
);

export const { effectComponent, effectAction } = childRuntime(
  Layer.mergeAll(TodoRepoLive)
);
