import { db } from "./db.js";

db.exec("DELETE FROM products");
const insert = db.prepare(
    "INSERT INTO products (name, price, created_at) VALUES (?, ?, ?)",
);
const start = Date.parse("2026-01-01T00:00:00Z");

db.exec("BEGIN");
for (let i = 1; i <= 500; i++) {
    const price = Math.round((Math.random() * 100 + 1) * 100) / 100;
    const createdAt = new Date(
        start + Math.floor(i / 3) * 60_000,
    ).toISOString();
    insert.run(`Product ${i}`, price, createdAt);
}
db.exec("COMMIT");

console.log("Seeded 500 products");
