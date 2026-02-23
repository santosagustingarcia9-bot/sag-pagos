const express = require("express");
const mercadopago = require("mercadopago");

const app = express();
app.use(express.json());

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});

// =========================
// PAGINA PRINCIPAL
// =========================

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SAG & SK - Pago</title>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f4f6f9;
}

.container {
  max-width: 500px;
  margin: 40px auto;
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 15px 40px rgba(0,0,0,0.08);
}

.brand {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
}

.brand img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
}

.brand-text h2 {
  margin: 0;
  font-size: 20px;
}

.brand-text span {
  color: #2ecc71;
  font-size: 14px;
  font-weight: 500;
}

h1 {
  font-size: 22px;
  margin-top: 20px;
  margin-bottom: 10px;
}

.summary {
  margin-top: 20px;
  font-size: 15px;
}

.total {
  margin-top: 25px;
  text-align: center;
}

.total span {
  display: block;
  font-size: 14px;
  color: gray;
}

.total h2 {
  font-size: 32px;
  margin: 10px 0;
}

button {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(90deg,#6366f1,#7c3aed);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
}

.secure {
  text-align: center;
  margin-top: 15px;
  font-size: 13px;
  color: gray;
}
</style>
</head>

<body>

<div class="container">

  <div class="brand">
    <img src="https://i.ibb.co/3Jv3hYH/logo.png" alt="Logo">
    <div class="brand-text">
      <h2>SAG & SK</h2>
      <span>✔ Pronosticador verificado</span>
    </div>
  </div>

  <h1>COMBINADA DEL DÍA</h1>

  <div class="summary">
    Producto: Combinada Premium
  </div>

  <div class="total">
    <span>Total a pagar</span>
    <h2>$ 5.000 ARS</h2>
  </div>

  <form action="/crear-preferencia" method="POST">
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

// =========================
// CREAR PREFERENCIA
// =========================

app.post("/crear-preferencia", async (req, res) => {
  try {
    const preference = {
      items: [
        {
          title: "SAG & SK - COMBINADA DEL DÍA",
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

app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor funcionando 🚀");
});
