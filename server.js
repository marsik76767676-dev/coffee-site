require("dotenv").config();
const express = require("express");

const app = express();

app.use(express.json());
app.use(express.static(__dirname));

app.post("/send-order", async (req, res) => {
  try {
    const text = req.body.text;

    const response = await fetch(
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

    const data = await response.json();

    if (data.ok) {
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false });
    }

  } catch (error) {
    res.status(500).json({ success: false });
  }
});

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});