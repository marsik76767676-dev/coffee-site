const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// 📂 Правильний шлях до файлу бази
const dbPath = path.join(__dirname, "orders.db");

// 📦 Створюємо або підключаємось до бази
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Помилка підключення до бази:", err.message);
  } else {
    console.log("✅ Підключено до SQLite");
  }
});

// 🧱 Створюємо таблицю якщо її немає
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;