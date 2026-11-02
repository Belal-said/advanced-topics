import { DatabaseSync } from "node:sqlite";

export const db = new DatabaseSync("shop.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id         INTEGER PRIMARY KEY,
    name       TEXT    NOT NULL,
    price      REAL    NOT NULL,
    created_at TEXT    NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_products_price_id   ON products(price, id);
  CREATE INDEX IF NOT EXISTS idx_products_created_id ON products(created_at, id);
`);
