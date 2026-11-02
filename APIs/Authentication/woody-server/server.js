import express from "express";
import pool from "./src/config/db.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
const app = express();

app.use(express.json());

function requireAuth(req, res, next) {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) return res.json({ message: "Not authenticated" });

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.json({ message: "Not authenticated" });
    }
}

function requirePermission(...keys) {
    return async (req, res, next) => {
        const found = await pool.query(
            `select 1
            from users_roles ur
            join roles_permissions rp on rp.role_id = ur.role_id
            join permissions p        on p.id = rp.permission_id
            where ur.user_id = $1 and p.key = any($2)

            union

            select 1
            from users_permissions up
            join permissions p on p.id = up.permission_id
            where up.user_id = $1 and p.key = any($2)

            limit 1`,
            [req.user.id, keys],
        );

        if (!found.rows[0])
            return res.status(403).json({ message: "Forbidden" });

        next();
    };
}

app.get(
    "/home",
    requireAuth,
    requirePermission("home:view"),
    async (req, res) => {
        res.end("This is the home page");
    },
);

app.get(
    "/tips",
    requireAuth,
    requirePermission("tips:view", "tips:write"),
    async (req, res) => {
        res.end("This is the tips page");
    },
);

app.get(
    "/checklists",
    requireAuth,
    requirePermission("checklists:view", "checklists:write"),
    async (req, res) => {
        res.end("This is the checklists page");
    },
);

app.get(
    "/menus",
    requireAuth,
    requirePermission("menus:view", "menus:manage"),
    async (req, res) => {
        res.end("This is the menus page");
    },
);

app.get(
    "/sales",
    requireAuth,
    requirePermission("sales:view"),
    async (req, res) => {
        res.end("This is the sales page");
    },
);

app.get(
    "/membership",
    requireAuth,
    requirePermission("membership:view", "membership:manager"),
    async (req, res) => {
        res.end("This is the membership page");
    },
);

// Basic Registeration Practice
app.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role)
        return res.status(400).json({ message: "Incomplete data" });

    const roleFound = await pool.query("select id from roles where name = $1", [
        role,
    ]);
    if (!roleFound.rows[0])
        return res.status(400).json({ message: "Unknown role" });

    const usersFound = await pool.query(
        "select 1 from users where email = $1",
        [email],
    );
    if (usersFound.rows[0])
        return res.status(409).json({ message: "User already exists" });

    const hashedPassword = await argon2.hash(password);

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const newUser = await client.query(
            `insert into users (name, email, password)
                values ($1, $2, $3) returning id`,
            [name, email, hashedPassword],
        );

        await client.query(
            "insert into users_roles (user_id, role_id) values ($1, $2)",
            [newUser.rows[0].id, roleFound.rows[0].id],
        );

        await client.query("COMMIT");
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }

    res.status(201).json({ message: "Registration successful" });
});

// Basic Authentication Practice
// Basic JWT generation and sending to the client.
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if ((!email, !password)) return res.end("Incomplete Data");

    const selectedUsers = await pool.query(
        "select * from users where email = $1",
        [email],
    );

    if (!selectedUsers.rows[0]) return res.end("Incorrect email or password");

    const matchedPassword = await argon2.verify(
        selectedUsers.rows[0].password,
        password,
    );

    if (!matchedPassword) return res.end("Incorrect email or password");

    const user = selectedUsers.rows[0];

    const permissions = await pool.query(
        `SELECT p.key
        FROM users_roles ur
        JOIN roles_permissions rp ON rp.role_id = ur.role_id
        JOIN permissions p        ON p.id = rp.permission_id
        WHERE ur.user_id = $1`,
        [user.id],
    );
    // permissions.rows -> [{ key: 'tips:view' }, ...]
    const permissionsRows = permissions.rows;
    // permissions.rows.map(r => r.key) -> ['tips:view', ...]

    const token = jwt.sign(
        { id: user.id, role: user.role, permissionsRows },
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
    );

    // in your login handler, after jwt.sign:
    res.cookie("token", token, {
        httpOnly: true, // JS can never read it
        secure: false, // true in production (https only)
        sameSite: "lax", // CSRF guard
        maxAge: 24 * 60 * 60 * 1000, // 1 day, in ms
    });

    res.json({
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token,
        permissionsRows,
    });
});

const PORT = 8001;
app.listen(PORT, () => {
    console.log("App is running on port: 8001");
});
