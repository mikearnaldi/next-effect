import { ParseResult, Schema } from "@effect/schema";
import { Effect, Exit, Layer, Runtime, Scope } from "effect";
import { pretty } from "effect/Cause";
import { globalValue } from "effect/GlobalValue";
import { defaultRuntime, makeFiberFailure } from "effect/Runtime";
import { CloseableScope } from "effect/Scope";

const FormDataSchema = Schema.unknown.pipe(
  Schema.filter((u): u is FormData => u instanceof FormData)
);

export const formData = <I extends { [k: string]: string }, A>(
  schema: Schema.Schema<I, A>
) =>
  Schema.transformOrFail(
    Schema.to(FormDataSchema),
    schema,
    (_) => Schema.parse(Schema.from(schema))(Object.fromEntries(_)),
    (_) =>
      ParseResult.map(Schema.encode(Schema.from(schema))(_), (i) => {
        const data = new FormData();
        Object.keys(i as any).map((k) => {
          data.append(k, i[k]);
        });
        return data;
      })
  );

export interface NextRuntime<R> {
  cleanup: Effect.Effect<never, never, void>;
  runEffect: <E, A>(body: Effect.Effect<R, E, A>) => Promise<A>;
  runtime: Promise<Runtime.Runtime<R> & { scope: CloseableScope }>;
  childRuntime: {
    <E, A>(layer: Layer.Layer<R, E, A>): NextRuntime<A | R>;
  };
  effectComponent: <E, A>(body: Effect.Effect<R, E, A>) => () => Promise<A>;
  effectAction: <Schemas extends Schema.Schema<any, any>[]>(
    ...schemas: Schemas
  ) => <
    E,
    A,
    Args extends { [k in keyof Schemas]: Schema.Schema.To<Schemas[k]> }
  >(
    body: (...args: Args) => Effect.Effect<R, E, A>
  ) => (
    ...args: {
      [k in keyof Args]: k extends keyof Schemas
        ? Schemas[k] extends Schema.Schema<any, any>
          ? Schema.Schema.From<Schemas[k]>
          : never
        : never;
    } extends infer X extends ReadonlyArray<any>
      ? X
      : []
  ) => Promise<A>;
}

const nextRuntime: {
  <E, A, R>(
    parent: Promise<Runtime.Runtime<R>>,
    layer: Layer.Layer<never, E, A>
  ): NextRuntime<A>;
  <E, A>(layer: Layer.Layer<never, E, A>): NextRuntime<A>;
} = function () {
  const layer: Layer.Layer<never, any, any> =
    arguments.length === 1 ? arguments[0] : arguments[1];

  const parent: Promise<Runtime.Runtime<any>> =
    arguments.length === 1 ? Promise.resolve(defaultRuntime) : arguments[0];

  const makeRuntime = parent.then((runtime: Runtime.Runtime<any>) =>
    Runtime.runPromise(runtime)(
      Effect.gen(function* ($) {
        const scope = yield* $(Scope.make());
        const runtime = yield* $(Layer.toRuntime(layer), Scope.extend(scope));
        return {
          ...runtime,
          scope,
        };
      })
    )
  );

  const run = async <E, A>(
    body: Effect.Effect<Layer.Layer.Success<typeof layer>, E, A>
  ) => {
    const runtime = await makeRuntime;
    return await new Promise<A>((res, rej) => {
      const fiber = Runtime.runFork(runtime)(body);
      fiber.addObserver((exit) => {
        if (Exit.isSuccess(exit)) {
          res(exit.value);
        } else {
          const failure = makeFiberFailure(exit.cause);
          const error = new Error();
          error.message = failure.message;
          error.name = failure.name;
          error.stack = pretty(exit.cause);
          rej(error);
        }
      });
    });
  };

  return {
    cleanup: Effect.flatMap(
      Effect.promise(() => makeRuntime),
      ({ scope }) => Scope.close(scope, Exit.unit)
    ),
    runEffect: run,
    runtime: makeRuntime,
    childRuntime: (layer: any) => nextRuntime(makeRuntime, layer),
    effectComponent: (self: any) => () => run(self),
    effectAction:
      <Schemas extends Schema.Schema<any, any>[]>(...schemas: Schemas) =>
      <E, A>(
        body: (
          ...args: { [k in keyof Schemas]: Schema.Schema.To<Schemas[k]> }
        ) => Effect.Effect<any, E, A>
      ) =>
      (
        ...args: { [k in keyof Schemas]: Schema.Schema.From<Schemas[k]> }
      ): Promise<A> => {
        return Effect.all(
          schemas.map((schema, i) => Schema.parse(schema)(args[i]))
        ).pipe(
          Effect.orDie,
          Effect.flatMap((decoded) => body(...(decoded as any))),
          run
        );
      },
  } as any;
};

export const integrate = <E, R, E1, R1>(
  globalLayer: Layer.Layer<never, E, R>,
  localLayer: Layer.Layer<R, E1, R1>
) => {
  const { childRuntime } = globalValue("@app/GlobalRuntime", () => {
    const runtime = nextRuntime(globalLayer);
    const hook = () => {
      const cleanupId = "runtime/cleanup";
      if (cleanupId in globalThis) {
        return;
      }
      Object.assign(globalThis, { cleanupId: true });
      Effect.runFork(
        Effect.tap(runtime.cleanup, () =>
          Effect.sync(() => {
            process.exit(0);
          })
        )
      );
    };
    process.once("SIGTERM", hook);
    process.once("SIGINT", hook);
    return runtime;
  });

  const { effectComponent, effectAction } = childRuntime(localLayer);

  return { effectComponent, effectAction };
};
