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

/* ===============================
   PAGINA PRINCIPAL PROFESIONAL
================================= */

app.get("/", (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>Stake 10 + Combinada</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        margin:0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background:#f5f6f8;
      }

      .wrapper{
        max-width:500px;
        margin:40px auto;
        background:white;
        border-radius:25px;
        padding:30px;
        box-shadow:0 20px 50px rgba(0,0,0,0.08);
      }

      .brand{
        display:flex;
        align-items:center;
        gap:15px;
        margin-bottom:25px;
      }

      .brand img{
        width:70px;
        height:70px;
        border-radius:50%;
        object-fit:cover;
      }

      .brand h2{
        margin:0;
        font-size:20px;
        font-weight:700;
      }

      .verified{
        color:#16a34a;
        font-size:14px;
      }

      h1{
        font-size:26px;
        margin:20px 0 10px 0;
      }

      .price{
        font-size:28px;
        font-weight:800;
        margin-bottom:25px;
      }

      input{
        width:100%;
        padding:15px;
        border-radius:12px;
        border:1px solid #ddd;
        margin-bottom:20px;
        font-size:16px;
      }

      button{
        width:100%;
        padding:16px;
        border:none;
        border-radius:14px;
        font-size:18px;
        font-weight:600;
        color:white;
        cursor:pointer;
        background: linear-gradient(90deg,#6366f1,#7c3aed);
      }

      button:hover{
        opacity:0.9;
      }

      .secure{
        text-align:center;
        margin-top:15px;
        color:#777;
        font-size:14px;
      }

    </style>
  </head>
  <body>

    <div class="wrapper">

      <div class="brand">
        <img src="https://i.imgur.com/4M34hi2.png">
        <div>
          <h2>SAG & SK</h2>
          <div class="verified">✔ Tipster verificado</div>
        </div>
      </div>

      <h1>STAKE 10 + COMBINADA</h1>
      <div class="price">$ 5.000 ARS</div>

      <form action="/crear-preferencia" method="POST">
        <input type="text" name="nombre" placeholder="Tu nombre completo" required>
        <button type="submit">Pagar ahora</button>
      </form>

      <div class="secure">
        Pago seguro con MercadoPago
      </div>

    </div>

  </body>
  </html>
  `);
});

/* ===============================
   CREAR PREFERENCIA
================================= */

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
      back_urls: {
        success: "https://t.me/+RRHCFN_UET1hMTQx",
        failure: "https://t.me/+RRHCFN_UET1hMTQx",
        pending: "https://t.me/+RRHCFN_UET1hMTQx"
      },
      auto_return: "approved",
      notification_url: "https://sag-pagos-production.up.railway.app/webhook"
    };

    const response = await mercadopago.preferences.create(preference);

    res.redirect(response.body.init_point);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ===============================
   WEBHOOK
================================= */

app.post("/webhook", async (req, res) => {
  try {

    if (req.body.type === "payment") {

      const payment = await mercadopago.payment.findById(req.body.data.id);

      if (payment.body.status === "approved") {

        await axios.post(
          `https://api.telegram.org/bot${TELEGRAM_TOKEN}/createChatInviteLink`,
          {
            chat_id: GROUP_ID,
            member_limit: 1
          }
        );
      }
    }

    res.sendStatus(200);

  } catch (error) {
    res.sendStatus(500);
  }
});

app.listen(process.env.PORT || 3000);
