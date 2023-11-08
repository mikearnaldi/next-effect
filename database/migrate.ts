import * as Sqlfx from "@sqlfx/sqlite/node";
import * as Migrator from "@sqlfx/sqlite/Migrator/Node";
import { Config, Effect, Layer } from "effect";
export const Sql = Sqlfx.tag;

export const SqlLive = Layer.provideMerge(
  Sqlfx.makeLayer({
    filename: Config.succeed("database/db.sqlite"),
    transformQueryNames: Config.succeed(Sqlfx.transform.camelToSnake),
    transformResultNames: Config.succeed(Sqlfx.transform.snakeToCamel),
  }),
  Migrator.makeLayer({
    loader: Migrator.fromDisk(`${__dirname}/../migrations`),
  })
).pipe(Layer.orDie);

Effect.unit.pipe(Effect.provide(SqlLive), Effect.runFork);
