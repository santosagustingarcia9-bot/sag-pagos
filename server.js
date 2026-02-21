const express = require("express");
const mercadopago = require("mercadopago");

const app = express();
app.use(express.json());

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});

app.get("/", (req, res) => {
  res.send("SAG y SK servidor funcionando ✅");
});

app.post("/crear-preferencia", async (req, res) => {
  try {
    const preference = {
      items: [
        {
          title: "SAG y SK - COMBINADA DEL DÍA",
          unit_price: 5000,
          quantity: 1
        }
      ]
    };

    const response = await mercadopago.preferences.create(preference);

    res.json({
      link: response.body.init_point
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(process.env.PORT || 3000);
