import { SqlLive } from "@/services/Sql";
import * as Migrator from "@sqlfx/sqlite/Migrator/Node";
import { Effect, Layer } from "effect";

Effect.log("Migrations Complete").pipe(
  Effect.provide(
    Migrator.makeLayer({
      loader: Migrator.fromDisk(`${__dirname}/../migrations`),
    }).pipe(Layer.provide(SqlLive))
  ),
  Effect.runFork
);
