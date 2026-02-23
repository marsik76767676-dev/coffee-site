console.log("🔥 NEW VERSION DEPLOYED");

require("dotenv").config();
const express = require("express");
const session = require("express-session");
const db = require("./database");

const app = express();

/* ================================
   ⚙️ MIDDLEWARE
================================ */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

/* ================================
   📦 SEND ORDER
================================ */
app.post("/send-order", async (req, res) => {
  try {
    const { text } = req.body;

    console.log("Отримано:", text);

    // Зберігаємо в PostgreSQL
    await db.query(
      "INSERT INTO orders (text) VALUES ($1)",
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

/* ================================
   📊 GET ORDERS (JSON)
================================ */
app.get("/orders", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM orders ORDER BY id DESC"
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});
/* ================================
   🔐 LOGIN PAGE
================================ */
app.get("/login", (req, res) => {
  res.send(`
    <h2>🔐 Вхід в адмінку</h2>
    <form method="POST" action="/login">
      <input type="password" name="password" placeholder="Пароль" required />
      <button type="submit">Увійти</button>
    </form>
  `);
});

/* ================================
   🔐 LOGIN PROCESS
================================ */
app.post("/login", (req, res) => {
  const { password } = req.body;

  if (password === process.env.ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.redirect("/admin");
  }

  res.send("❌ Невірний пароль");
});

/* ================================
   🧑‍💻 ADMIN PANEL (захищена)
================================ */
app.get("/admin", async (req, res) => {

  if (!req.session.isAdmin) {
    return res.redirect("/login");
  }

  try {
    const result = await db.query(
      "SELECT * FROM orders ORDER BY id DESC"
    );

    const rows = result.rows;

    let totalOrders = rows.length;
    let totalRevenue = 0;

    rows.forEach(order => {
      const match = order.text?.match(/Сума: (\d+)/);
      if (match) {
        totalRevenue += parseInt(match[1]);
      }
    });

    let html = `
      <h1>☕ Адмін панель</h1>
      <p>Замовлень: ${totalOrders}</p>
      <p>Дохід: ${totalRevenue} грн</p>
      <a href="/logout">Вийти</a>
      <hr>
    `;

    rows.forEach(order => {
      html += `<pre>${order.text}</pre><hr>`;
    });

    res.send(html);

  } catch (err) {
    console.error(err);
    res.send("DB error");
  }
});

/* ================================
   🚪 LOGOUT
================================ */
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

/* ================================
   🚀 START SERVER
================================ */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});