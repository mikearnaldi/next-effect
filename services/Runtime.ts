import { integrate } from "@/lib/effect";
import { Layer } from "effect";
import { SqlLive } from "./Sql";
import { TodoRepoLive } from "./TodoRepo";
import { TracingLive } from "./Tracing";

/**
 * The following layer may contain resources such as database connections,
 * the resources allocated via this layer will be cleared on process exit.
 *
 * Note: this layer will not reload during development
 */
const GlobalLive = SqlLive.pipe(Layer.provide(TracingLive));

/**
 * The following layer can't contain resources such as database connections,
 * the resources allocated via this layer will never be cleared.
 *
 * Note: this layer will reload during development
 */
const LocalLive = Layer.mergeAll(TodoRepoLive);

/**
 * The utilities exported here are meant to be used to create server components
 * and server actions with native support for effect
 */
export const { effectComponent, effectAction } = integrate(
  GlobalLive,
  LocalLive
);
