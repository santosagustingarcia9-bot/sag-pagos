const express = require("express");
const path = require("path");
const { MercadoPagoConfig, Preference } = require("mercadopago");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// CONFIG MERCADOPAGO (SDK NUEVO)
// ===============================
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

// ===============================
// PAGINA PRINCIPAL
// ===============================
app.get("/", (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>SAG & SK - Pago</title>

    <script src="https://sdk.mercadopago.com/js/v2"></script>

    <style>
      body {
        margin:0;
        font-family: Arial, sans-serif;
        background:#0b1c2d;
        color:white;
        text-align:center;
      }

      .container {
        max-width:500px;
        margin:40px auto;
        background:#10283d;
        padding:30px;
        border-radius:20px;
      }

      h1 { margin-bottom:10px; }

      .price {
        font-size:40px;
        font-weight:bold;
        margin:20px 0;
      }

      button {
        background:#6c3df4;
        border:none;
        padding:15px 30px;
        font-size:18px;
        border-radius:10px;
        color:white;
        cursor:pointer;
      }

      button:hover {
        opacity:0.9;
      }

      .secure {
        margin-top:20px;
        opacity:0.7;
      }
    </style>
  </head>

  <body>
    <div class="container">
      <h1>SAG & SK</h1>
      <h2>COMBINADA DEL DÍA</h2>
      <div class="price">$ 5000 ARS</div>

      <button onclick="createPayment()">Pagar ahora</button>

      <div class="secure">PAGOS SEGUROS</div>
    </div>

    <script>
      async function createPayment() {
        const response = await fetch("/create_preference", {
          method: "POST",
        });

        const data = await response.json();

        const mp = new MercadoPago("${process.env.MP_PUBLIC_KEY || ""}");
        mp.checkout({
          preference: {
            id: data.id
          },
          autoOpen: true
        });
      }
    </script>
  </body>
  </html>
  `);
});

// ===============================
// CREAR PREFERENCIA
// ===============================
app.post("/create_preference", async (req, res) => {
  try {
    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: [
          {
            title: "COMBINADA DEL DÍA",
            quantity: 1,
            unit_price: 5000,
            currency_id: "ARS",
          },
        ],
      },
    });

    res.json({ id: response.id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creando preferencia" });
  }
});

// ===============================
// SERVER
// ===============================
app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor funcionando");
});
