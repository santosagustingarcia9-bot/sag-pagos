const express = require("express");
const { MercadoPagoConfig, Preference } = require("mercadopago");

const app = express();
app.use(express.json());

// 🔐 Configuración correcta SDK v2
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

const preference = new Preference(client);

// 🏠 Ruta principal
app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente ✅");
});

// 💳 Crear preferencia
app.post("/crear-preferencia", async (req, res) => {
  try {
    const body = {
      items: [
        {
          title: "Combinada del día",
          quantity: 1,
          unit_price: 5000,
          currency_id: "ARS",
        },
      ],
    };

    const result = await preference.create({ body });

    res.json({
      id: result.id,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error creando preferencia",
    });
  }
});

// 🚀 Puerto Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
