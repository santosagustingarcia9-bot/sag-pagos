const express = require("express");
const mercadopago = require("mercadopago");
const axios = require("axios");

const app = express();
app.use(express.json());

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const GROUP_ID = process.env.GROUP_ID;

app.get("/", (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>Stake 10 + Combinada</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        margin: 0;
        font-family: 'Segoe UI', sans-serif;
        background: #f4f6fb;
      }

      .wrapper {
        max-width: 420px;
        margin: 40px auto;
        background: white;
        border-radius: 20px;
        padding: 30px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      }

      .logo {
        width: 90px;
        height: 90px;
        border-radius: 50%;
        margin: 0 auto 15px auto;
        display: block;
      }

      h1 {
        text-align: center;
        font-size: 26px;
        margin-bottom: 5px;
      }

      .price {
        text-align: center;
        font-size: 28px;
        font-weight: bold;
        margin: 20px 0;
      }

      input {
        width: 100%;
        padding: 14px;
        border-radius: 12px;
        border: 1px solid #ddd;
        margin-bottom: 20px;
        font-size: 16px;
      }

      button {
        width: 100%;
        padding: 16px;
        border-radius: 14px;
        border: none;
        font-size: 16px;
        font-weight: bold;
        color: white;
        cursor: pointer;
        background: linear-gradient(90deg, #6a5af9, #5b47f0);
      }

      button:hover {
        opacity: 0.9;
      }

      .footer {
        text-align: center;
        font-size: 12px;
        margin-top: 20px;
        color: #777;
      }
    </style>
  </head>
  <body>

    <div class="wrapper">

      <img class="logo" src="https://i.imgur.com/8Km9tLL.png" />

      <h1>STAKE 10 + COMBINADA</h1>
      <div class="price">$ 5.000 ARS</div>

      <input type="text" id="nombre" placeholder="Tu nombre completo" required>

      <button onclick="pagar()">Pagar ahora</button>

      <div class="footer">
        Pago seguro con MercadoPago
      </div>

    </div>

    <script>
      async function pagar() {
        const nombre = document.getElementById("nombre").value;
        if(!nombre) {
          alert("Ingresá tu nombre");
          return;
        }

        const res = await fetch("/crear-preferencia", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre })
        });

        const data = await res.json();
        window.location.href = data.link;
      }
    </script>

  </body>
  </html>
  `);
});

// Crear preferencia
app.post("/crear-preferencia", async (req, res) => {
  try {

    const preference = {
      items: [
        {
          title: "SAG y SK - COMBINADA DEL DÍA",
          unit_price: 5000,
          quantity: 1
        }
      ],
      notification_url: "https://sag-pagos-production.up.railway.app/webhook"
    };

    const response = await mercadopago.preferences.create(preference);

    res.json({
      link: response.body.init_point
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook
app.post("/webhook", async (req, res) => {
  try {

    if (req.body.type === "payment") {

      const payment = await mercadopago.payment.findById(req.body.data.id);

      if (payment.body.status === "approved") {

        const invite = await axios.post(
          `https://api.telegram.org/bot${TELEGRAM_TOKEN}/createChatInviteLink`,
          {
            chat_id: GROUP_ID,
            member_limit: 1
          }
        );

        console.log("Link creado:", invite.data.result.invite_link);
      }
    }

    res.sendStatus(200);

  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.listen(process.env.PORT || 3000);
