const express = require("express");
const mercadopago = require("mercadopago");
const axios = require("axios");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHANNEL_ID = process.env.GROUP_ID; // tu canal privado

// 🔹 Página principal
app.get("/", (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>Stake 10 + Combinada</title>
    <style>
      body {
        font-family: Arial;
        background: #f4f6fb;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
      }
      .card {
        background: white;
        width: 400px;
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        text-align: center;
      }
      h1 { margin-bottom: 10px; }
      .price {
        font-size: 28px;
        font-weight: bold;
        margin: 20px 0;
      }
      input {
        width: 100%;
        padding: 12px;
        border-radius: 8px;
        border: 1px solid #ddd;
        margin-top: 15px;
      }
      button {
        width: 100%;
        margin-top: 20px;
        padding: 15px;
        border-radius: 10px;
        border: none;
        background: linear-gradient(90deg, #6c63ff, #4e4bff);
        color: white;
        font-size: 18px;
        cursor: pointer;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>STAKE 10 + COMBINADA</h1>
      <div class="price">$5.000 ARS</div>
      <form action="/crear-preferencia" method="POST">
        <input type="text" name="nombre" placeholder="Tu nombre completo" required />
        <button type="submit">Pagar ahora</button>
      </form>
    </div>
  </body>
  </html>
  `);
});

// 🔹 Crear preferencia MercadoPago
app.post("/crear-preferencia", async (req, res) => {
  try {

    const preference = {
      items: [
        {
          title: "Stake 10 + Combinada",
          unit_price: 5000,
          quantity: 1
        }
      ],
      back_urls: {
        success: "https://sag-pagos-production.up.railway.app/success",
        failure: "https://sag-pagos-production.up.railway.app"
      },
      auto_return: "approved"
    };

    const response = await mercadopago.preferences.create(preference);

    res.redirect(response.body.init_point);

  } catch (error) {
    res.send("Error creando pago");
  }
});

// 🔹 Cuando vuelve aprobado
app.get("/success", async (req, res) => {
  try {

    // Crear link único al canal
    const invite = await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/createChatInviteLink`,
      {
        chat_id: CHANNEL_ID,
        member_limit: 1
      }
    );

    const link = invite.data.result.invite_link;

    res.send(`
      <h1>✅ Pago aprobado</h1>
      <h2>Accedé a tu canal privado:</h2>
      <a href="${link}" style="
        display:inline-block;
        margin-top:20px;
        padding:15px 25px;
        background:#4e4bff;
        color:white;
        text-decoration:none;
        border-radius:10px;
        font-size:18px;">
        Entrar al canal
      </a>
    `);

  } catch (error) {
    res.send("Pago aprobado pero hubo error creando link.");
  }
});

app.listen(process.env.PORT || 3000);
