const express = require("express");
const path = require("path");
const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

const preference = new Preference(client);
const payment = new Payment(client);

// 🔒 PRECIO FIJO (NO MODIFICABLE DESDE FRONTEND)
const PRECIO = 5000;

// ============================
// CREAR PREFERENCIA (BOTÓN MP)
// ============================
app.post("/crear-preferencia", async (req, res) => {
  try {
    const body = {
      items: [{
        title: "Combinada del día",
        quantity: 1,
        unit_price: PRECIO,
        currency_id: "ARS"
      }]
    };

    const result = await preference.create({ body });

    res.json({ id: result.id });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al crear preferencia" });
  }
});

// ============================
// PROCESAR PAGO TARJETA
// ============================
app.post("/procesar-pago", async (req, res) => {
  try {

    const {
      token,
      installments,
      paymentMethodId,
      issuerId,
      email,
      identificationType,
      identificationNumber
    } = req.body;

    // 🔒 El monto SIEMPRE es el fijo del servidor
    const body = {
      transaction_amount: PRECIO,
      token: token,
      description: "Combinada del día",
      installments: Number(installments),
      payment_method_id: paymentMethodId,
      issuer_id: issuerId,
      payer: {
        email: email, // ✅ EMAIL REAL DEL CLIENTE
        identification: {
          type: identificationType,
          number: identificationNumber,
        }
      }
    };

    const result = await payment.create({ body });

    res.json({
      status: result.status,
      status_detail: result.status_detail
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error en pago" });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor funcionando");
});
