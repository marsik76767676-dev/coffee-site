require("dotenv").config();
const express = require("express");
const db = require("./database");

const app = express();

app.use(express.json());
app.use(express.static(__dirname));

app.post("/send-order", async (req, res) => {
  try {
    const { name, phone, product, quantity } = req.body;

    // 🔥 1. Зберігаємо в базу
    db.run(
      `INSERT INTO orders (name, phone, product, quantity)
       VALUES (?, ?, ?, ?)`,
      [name, phone, product, quantity]
    );

    // 🔥 2. Відправляємо в Telegram
    const response = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: process.env.CHAT_ID,
          text: `
Нове замовлення:
Ім'я: ${name}
Телефон: ${phone}
Товар: ${product}
Кількість: ${quantity}
          `
        })
      }
    );

    const data = await response.json();

    if (data.ok) {
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

const PORT = process.env.PORT || 3000;
app.get("/orders", (req, res) => {
  db.all("SELECT * FROM orders", [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});