import * as Sqlfx from "@sqlfx/sqlite/node";
import { Config, Layer } from "effect";

export const Sql = Sqlfx.tag;

export const SqlLive = Sqlfx.makeLayer({
  filename: Config.succeed(
    process.cwd().replace(".next/standalone", "") + "/database/db.sqlite"
  ),
  transformQueryNames: Config.succeed(Sqlfx.transform.camelToSnake),
  transformResultNames: Config.succeed(Sqlfx.transform.snakeToCamel),
}).pipe(Layer.orDie);
