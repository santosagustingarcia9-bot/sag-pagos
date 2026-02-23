const express = require("express");
const mercadopago = require("mercadopago");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const GROUP_ID = process.env.GROUP_ID;
const BASE_URL = process.env.BASE_URL;

/* =======================
   PAGINA PRINCIPAL
======================= */

app.get("/", (req, res) => {

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>SAG y SK - Combinada</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body{
        margin:0;
        font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
        background:#f5f6f8;
      }
      .card{
        max-width:480px;
        margin:30px auto;
        background:white;
        border-radius:20px;
        padding:25px;
        box-shadow:0 15px 40px rgba(0,0,0,0.08);
      }
      .brand{
        display:flex;
        align-items:center;
        gap:15px;
        margin-bottom:20px;
      }
      .brand img{
        width:60px;
        height:60px;
        border-radius:50%;
      }
      h1{
        margin:0;
        font-size:22px;
      }
      h2{
        margin-top:20px;
        font-size:26px;
      }
      .price{
        font-size:32px;
        font-weight:bold;
        margin:20px 0;
      }
      input{
        width:100%;
        padding:15px;
        border-radius:10px;
        border:1px solid #ddd;
        font-size:16px;
        margin-bottom:15px;
      }
      button{
        width:100%;
        padding:15px;
        border:none;
        border-radius:12px;
        font-size:18px;
        font-weight:bold;
        color:white;
        background:linear-gradient(90deg,#6366f1,#4f46e5);
        cursor:pointer;
      }
      button:hover{
        opacity:0.9;
      }
      .methods{
        margin-top:20px;
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:10px;
      }
      .method{
        background:#f3f4f6;
        padding:15px;
        border-radius:10px;
        text-align:center;
        font-weight:600;
      }
      .secure{
        text-align:center;
        margin-top:15px;
        color:#666;
        font-size:14px;
      }
    </style>
  </head>

  <body>

    <div class="card">

      <div class="brand">
        <img src="https://via.placeholder.com/60">
        <div>
          <h1>SAG y SK</h1>
          <div>Pronosticador verificado</div>
        </div>
      </div>

      <h2>STAKE 10 + COMBINADA</h2>

      <div class="price">$ 5.000 ARS</div>

      <form action="/crear-preferencia" method="POST">
        <input name="nombre" placeholder="Tu nombre completo" required>
        <button type="submit">Pagar ahora</button>
      </form>

      <div class="methods">
        <div class="method">MercadoPago</div>
        <div class="method">Visa / Mastercard</div>
        <div class="method">Google Pay</div>
        <div class="method">Crypto</div>
      </div>

      <div class="secure">
        Pago seguro con MercadoPago
      </div>

    </div>

  </body>
  </html>
  `;

  res.send(html);
});


/* =======================
   CREAR PAGO
======================= */

app.post("/crear-preferencia", async (req, res) => {

  try {

    const preference = {
      items: [
        {
          title: "SAG y SK - Combinada",
          unit_price: 5000,
          quantity: 1
        }
      ],
      back_urls: {
        success: BASE_URL,
        failure: BASE_URL,
        pending: BASE_URL
      },
      auto_return: "approved",
      notification_url: BASE_URL + "/webhook"
    };

    const response = await mercadopago.preferences.create(preference);

    res.redirect(response.body.init_point);

  } catch (error) {
    console.log(error);
    res.send("Error al crear pago");
  }
});


/* =======================
   WEBHOOK TELEGRAM
======================= */

app.post("/webhook", async (req, res) => {

  try {

    if (req.body.type === "payment") {

      const payment = await mercadopago.payment.findById(req.body.data.id);

      if (payment.body.status === "approved") {

        const invite = await axios.post(
          "https://api.telegram.org/bot" + TELEGRAM_TOKEN + "/createChatInviteLink",
          {
            chat_id: GROUP_ID,
            member_limit: 1
          }
        );

        console.log("Link creado:", invite.data.result.invite_link);
      }
    }

    res.sendStatus(200);

  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.listen(process.env.PORT || 3000);
