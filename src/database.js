const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(process.env.APPDATA || '.', 'granimor.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    material_code TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    price REAL NOT NULL,
    count INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    location TEXT NOT NULL,
    phone TEXT NOT NULL,
    due_date TEXT NOT NULL,
    dimensions TEXT,
    material_cost REAL DEFAULT 0,
    additional_costs REAL DEFAULT 0,
    additional_cost_reason TEXT,
    comment TEXT,
    total_price REAL DEFAULT 0,
    status TEXT DEFAULT 'pending',
    paid_amount REAL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS order_materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    material_id INTEGER,
    dimensions TEXT,
    cost REAL,
    FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(material_id) REFERENCES materials(id)
  );

  CREATE TABLE IF NOT EXISTS cars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    make_model TEXT NOT NULL,
    plate_number TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL
  );
`);

module.exports = db;