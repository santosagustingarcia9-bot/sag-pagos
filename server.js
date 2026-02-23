const express = require("express");
const mercadopago = require("mercadopago");

const app = express();
app.use(express.json());

// CONFIG MERCADOPAGO
mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});

// =====================
// PAGINA PRINCIPAL
// =====================
app.get("/", (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SAG & SK - Pago</title>

    <style>
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #f4f6f9;
      }

      .container {
        max-width: 520px;
        margin: 40px auto;
        background: white;
        border-radius: 20px;
        padding: 30px;
        box-shadow: 0 15px 40px rgba(0,0,0,0.08);
        text-align: center;
      }

      .brand {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 15px;
        margin-bottom: 20px;
      }

      .brand img {
        width: 60px;
        height: 60px;
        border-radius: 50%;
      }

      .brand h2 {
        margin: 0;
      }

      .verified {
        color: #2ecc71;
        font-size: 14px;
      }

      h1 {
        margin-top: 25px;
        font-size: 28px;
      }

      .price {
        font-size: 42px;
        font-weight: bold;
        margin: 10px 0 30px 0;
      }

      .methods {
        display: flex;
        gap: 15px;
      }

      .method {
        flex: 1;
        border: 2px solid #e5e5e5;
        border-radius: 15px;
        padding: 20px;
        cursor: pointer;
        transition: 0.3s;
      }

      .method:hover {
        border-color: #6c5ce7;
      }

      .cards {
        margin-top: 10px;
        font-size: 13px;
        color: #555;
      }

      .btn {
        margin-top: 30px;
        width: 100%;
        padding: 16px;
        border: none;
        border-radius: 14px;
        font-size: 18px;
        font-weight: bold;
        color: white;
        cursor: pointer;
        background: linear-gradient(90deg, #6c5ce7, #5f27cd);
      }

      .secure {
        margin-top: 20px;
        color: #777;
        font-size: 14px;
      }

    </style>
  </head>

  <body>
    <div class="container">

      <div class="brand">
        <img src="https://i.ibb.co/3Jv3hYH/logo.png" />
        <div>
          <h2>SAG & SK</h2>
          <div class="verified">✔ Pronosticador verificado</div>
        </div>
      </div>

      <h1>COMBINADA DEL DÍA</h1>
      <div class="price">$ 5.000 ARS</div>

      <div class="methods">
        <div class="method" onclick="window.location='/pagar'">
          <img src="https://logodownload.org/wp-content/uploads/2019/06/mercado-pago-logo.png" width="120" />
          <div>MercadoPago</div>
        </div>

        <div class="method" onclick="window.location='/pagar'">
          <div style="font-size:18px;font-weight:bold;">Tarjeta</div>
          <div class="cards">
            Visa • Mastercard • Amex
          </div>
        </div>
      </div>

      <button class="btn" onclick="window.location='/pagar'">
        Pagar ahora
      </button>

      <div class="secure">
        PAGOS SEGUROS
      </div>

    </div>
  </body>
  </html>
  `);
});

// =====================
// CREAR PAGO MP
// =====================
app.get("/pagar", async (req, res) => {
  try {
    const preference = {
      items: [
        {
          title: "Combinada del día",
          unit_price: 5000,
          quantity: 1
        }
      ],
      back_urls: {
        success: process.env.BASE_URL,
        failure: process.env.BASE_URL,
        pending: process.env.BASE_URL
      },
      auto_return: "approved"
    };

    const response = await mercadopago.preferences.create(preference);

    res.redirect(response.body.init_point);

  } catch (error) {
    console.log(error);
    res.send("Error al crear el pago");
  }
});

// =====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor activo"));
