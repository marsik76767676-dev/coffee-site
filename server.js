console.log("🔥 NEW VERSION DEPLOYED");
require("dotenv").config();
const express = require("express");
const db = require("./database");

const app = express();

app.use(express.json());
app.use(express.static(__dirname));

app.post("/send-order", async (req, res) => {
  try {
    const { text } = req.body;

    console.log("Отримано:", text);

    // Зберігаємо повний текст
    db.run(
      `INSERT INTO orders (text) VALUES (?)`,
      [text]
    );

    // Відправляємо в Telegram
    await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: process.env.CHAT_ID,
          text: text
        })
      }
    );

    res.json({ success: true });

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
/* ================================
   🧑‍💻 АДМІН ПАНЕЛЬ
================================ */
app.get("/admin", (req, res) => {
  const password = req.query.password;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.send(`
      <h2>🔐 Введіть пароль</h2>
      <form>
        <input type="password" name="password" placeholder="Пароль" />
        <button type="submit">Увійти</button>
      </form>
    `);
  }

  db.all("SELECT * FROM orders ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      return res.send("Error loading orders");
    }

    let totalOrders = rows.length;
    let totalRevenue = 0;

    rows.forEach(order => {
      const match = order.text.match(/Сума: (\d+)/);
      if (match) {
        totalRevenue += parseInt(match[1]);
      }
    });

    let html = `
      <html>
      <head>
        <title>Адмін панель</title>
        <style>
          body { font-family: Arial; background:#111; color:white; padding:20px }
          .card { background:#222; padding:15px; margin-bottom:15px; border-radius:10px }
          .date { color:#888; font-size:12px; margin-bottom:10px }
          pre { white-space: pre-wrap }
        </style>
      </head>
      <body>
        <h1>☕ Адмін панель</h1>
        <p>Замовлень: ${totalOrders}</p>
        <p>Загальний дохід: ${totalRevenue} грн</p>
        <hr>
    `;

    rows.forEach(order => {
      html += `
        <div class="card">
          <div class="date">${order.created_at}</div>
          <pre>${order.text}</pre>
        </div>
      `;
    });

    html += `</body></html>`;

    res.send(html);
  });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});