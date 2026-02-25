const express = require("express");
const mercadopago = require("mercadopago");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});

// Crear preferencia (botón MercadoPago)
app.post("/create_preference", async (req, res) => {
  try {
    const preference = {
      items: [
        {
          title: "Combinada del día",
          unit_price: 5000,
          quantity: 1,
          currency_id: "ARS"
        }
      ]
    };

    const response = await mercadopago.preferences.create(preference);
    res.json({ id: response.body.id });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear pago con tarjeta
app.post("/process_payment", async (req, res) => {
  try {
    const paymentData = {
      transaction_amount: Number(req.body.transaction_amount),
      token: req.body.token,
      description: "Combinada del día",
      installments: Number(req.body.installments),
      payment_method_id: req.body.payment_method_id,
      payer: {
        email: req.body.payer.email
      }
    };

    const result = await mercadopago.payment.create(paymentData);
    res.json(result.body);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor corriendo");
});
