import { integrate } from "@/lib/effect";
import { Layer } from "effect";
import { SqlLive } from "./Sql";
import { TodoRepoLive } from "./TodoRepo";
import { TracingLive } from "./Tracing";

export const { effectComponent, effectAction } = integrate({
  globalLayer: SqlLive.pipe(Layer.provide(TracingLive)),
  localLayer: Layer.mergeAll(TodoRepoLive),
});
