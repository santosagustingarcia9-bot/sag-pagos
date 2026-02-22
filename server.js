const express = require("express");
const mercadopago = require("mercadopago");
const axios = require("axios");

const app = express();
app.use(express.json());

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHANNEL_ID = process.env.GROUP_ID;

// Página principal con botón de pago
app.get("/", (req, res) => {
  res.send(`
    <h1>SAG y SK - COMBINADA DEL DÍA</h1>
    <h2>Precio: $5000</h2>
    <button onclick="pagar()">Pagar ahora</button>

    <script>
      async function pagar() {
        const res = await fetch("/crear-preferencia", { method: "POST" });
        const data = await res.json();
        window.location.href = data.link;
      }
    </script>
  `);
});

// Crear preferencia MercadoPago
app.post("/crear-preferencia", async (req, res) => {
  try {

    const preference = {
      items: [
        {
          title: "COMBINADA DEL DÍA",
          unit_price: 5000,
          quantity: 1
        }
      ],
      back_urls: {
        success: "https://sag-pagos-production.up.railway.app/gracias",
        failure: "https://sag-pagos-production.up.railway.app",
        pending: "https://sag-pagos-production.up.railway.app"
      },
      auto_return: "approved",
      notification_url: "https://sag-pagos-production.up.railway.app/webhook"
    };

    const response = await mercadopago.preferences.create(preference);

    res.json({ link: response.body.init_point });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Variable temporal para guardar último link creado
let ultimoLink = null;

// Webhook MercadoPago
app.post("/webhook", async (req, res) => {
  try {

    if (req.body.type === "payment") {

      const payment = await mercadopago.payment.findById(req.body.data.id);

      if (payment.body.status === "approved") {

        const invite = await axios.post(
          `https://api.telegram.org/bot${TELEGRAM_TOKEN}/createChatInviteLink`,
          {
            chat_id: CHANNEL_ID,
            member_limit: 1
          }
        );

        ultimoLink = invite.data.result.invite_link;

        console.log("Link creado:", ultimoLink);
      }
    }

    res.sendStatus(200);

  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// Página después del pago
app.get("/gracias", (req, res) => {

  if (!ultimoLink) {
    return res.send("<h2>Procesando pago... refrescá en unos segundos.</h2>");
  }

  res.send(`
    <h1>Pago aprobado ✅</h1>
    <h2>Entrá a tu canal privado:</h2>
    <a href="${ultimoLink}" target="_blank">
      <button>Entrar al canal</button>
    </a>
  `);
});

app.listen(process.env.PORT || 3000);
