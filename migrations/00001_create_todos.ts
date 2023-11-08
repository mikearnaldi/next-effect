import * as Effect from "effect/Effect";
import * as Sql from "@sqlfx/sqlite/Client";

export default Effect.gen(function* ($) {
  const sql = yield* $(Sql.tag);

  yield* $(sql`
    CREATE TABLE todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        title VARCHAR(255) NOT NULL,
        status TEXT CHECK( status IN ('COMPLETED','CREATED') ) DEFAULT 'CREATED',
        created_at datetime NOT NULL DEFAULT current_timestamp,
        updated_at datetime NOT NULL DEFAULT current_timestamp
    )`);
});
