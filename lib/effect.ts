import { Schema } from "@effect/schema";
import { Context, Effect, Exit, Layer, Runtime, Scope } from "effect";
import { pretty } from "effect/Cause";
import { defaultRuntime, makeFiberFailure } from "effect/Runtime";

export interface FormDataService {
  readonly _: unique symbol;
}

export const FormDataService = Context.Tag<FormDataService, FormData>(
  "@services/FormDataService"
);

export const getFormData = <I, A>(schema: Schema.Schema<I, A>) =>
  Effect.flatMap(FormDataService, (entries) =>
    Schema.parse(schema)(Object.fromEntries(entries)).pipe(
      Effect.withSpan("parseFormData")
    )
  ).pipe(Effect.withSpan("getFormData"));

export interface NextRuntime<R> {
  runEffect: <E, A>(body: Effect.Effect<R, E, A>) => Promise<A>;
  runtime: Promise<Runtime.Runtime<R>>;
  childRuntime: {
    <E, A>(layer: Layer.Layer<never, E, A>): NextRuntime<A | R>;
  };
  effectComponent: <E, A>(body: Effect.Effect<R, E, A>) => () => Promise<A>;
  effectAction: <E, A>(
    body: (formData: FormData) => Effect.Effect<R | FormDataService, E, A>
  ) => (formData: FormData) => Promise<A>;
}

export const nextRuntime: {
  <E, A, R>(
    parent: Promise<Runtime.Runtime<R>>,
    layer: Layer.Layer<never, E, A>
  ): NextRuntime<A>;
  <E, A>(layer: Layer.Layer<never, E, A>): NextRuntime<A>;
} = function () {
  const layer: Layer.Layer<never, any, any> =
    arguments.length === 1 ? arguments[0] : arguments[1];

  const parent =
    arguments.length === 1 ? Promise.resolve(defaultRuntime) : arguments[0];

  const makeRuntime = parent.then((runtime: Runtime.Runtime<any>) =>
    Runtime.runPromise(runtime)(
      Effect.gen(function* ($) {
        const scope = yield* $(Scope.make());
        const runtime = yield* $(Layer.toRuntime(layer), Scope.extend(scope));
        return runtime;
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
    runEffect: run,
    runtime: makeRuntime,
    childRuntime: (layer: any) => nextRuntime(makeRuntime, layer),
    effectComponent: (self: any) => () => run(self),
    effectAction: (body: any) => (data: any) =>
      run(Effect.provideService(FormDataService, data)(body(data))),
  } as any;
};
