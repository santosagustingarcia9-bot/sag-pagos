const express = require("express");
const path = require("path");
const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");

const app = express();
app.use(express.json());

// 📌 Servir archivos estáticos
app.use(express.static(path.join(__dirname)));

// 📌 Ruta principal (ESTO ES LO QUE TE FALTABA)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 📌 Config MercadoPago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

const preference = new Preference(client);
const payment = new Payment(client);

// 📌 Crear preferencia (Botón MercadoPago)
app.post("/crear-preferencia", async (req, res) => {
  try {
    const body = {
      items: [{
        title: "Combinada del día",
        quantity: 1,
        unit_price: 5000,
        currency_id: "ARS"
      }]
    };

    const result = await preference.create({ body });
    res.json({ id: result.id });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error creando preferencia" });
  }
});

// 📌 Procesar pago con CardForm
app.post("/procesar-pago", async (req, res) => {
  try {
    const body = {
      transaction_amount: Number(req.body.amount),
      token: req.body.token,
      description: "Combinada del día",
      installments: Number(req.body.installments),
      payment_method_id: req.body.paymentMethodId,
      issuer_id: req.body.issuerId,
      payer: {
        email: "test@test.com",
        identification: {
          type: req.body.identificationType,
          number: req.body.identificationNumber,
        }
      }
    };

    const result = await payment.create({ body });

    res.json({
      status: result.status,
      detail: result.status_detail
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error en pago" });
  }
});

// 📌 Iniciar servidor
app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor funcionando");
});
