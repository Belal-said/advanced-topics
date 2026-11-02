import express from "express";
import { db } from "./db.js";

const app = express();
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function parseLimit(raw) {
    const n = Number.parseInt(raw ?? DEFAULT_LIMIT, 10);
    if (Number.isNaN(n) || n < 1) return DEFAULT_LIMIT;
    return Math.min(n, MAX_LIMIT);
}

const encodeCursor = (obj) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");

function decodedCursor(str) {
    try {
        return JSON.parse(Buffer.from(str, "base64url").toString());
    } catch {
        return null;
    }
}

app.get("/products/offset", (req, res) => {
    const limit = parseLimit(req.query.limit);
    const page = Math.max(1, Number.parseInt(req.query.page) || 1);
    const offset = (page - 1) * limit;

    console.log(limit);

    const data = db
        .prepare(`SELECT * FROM products ORDER BY id LIMIT ? OFFSET ?`)
        .all(limit, offset);
    const { total } = db
        .prepare(`SELECT COUNT(*) AS total FROM products`)
        .get();
    const totalPages = Math.ceil(total / limit);

    const link = (page) => `/products/offset?page=${page}&limit=${limit}`;

    res.json({
        data,
        pagination: { page, limit, total, totalPages },
        links: {
            self: link(page),
            next: page < totalPages ? link(page + 1) : null,
            prev: page > 1 ? link(page - 1) : null,
        },
    });
});

app.get("/products/cursor", (req, res) => {
    const limit = parseLimit(req.query.limit);
    let afterId = 0;

    if (req.query.cursor) {
        const c = decodedCursor(req.query.cursor);
        if (!Number.isInteger(c?.id))
            return res.status(400).json({ error: "Invalid cursor" });
        afterId = c.id;
    }

    const rows = db
        .prepare(`SELECT * FROM products WHERE id > ? ORDER BY id limit ?`)
        .all(afterId, limit + 1);

    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? encodeCursor({ id: data.at(-1).id }) : null;

    res.json({
        data,
        pagination: { limit, hasMore, nextCursor },
        links: {
            next: nextCursor
                ? `/products/curosr?limit=${limit}&cursor=${nextCursor}`
                : null,
        },
    });
});

app.listen(4001, () => console.log("App is running: http://localhost:4001"));
