const express = require("express");
const mercadopago = require("mercadopago");

const app = express();
app.use(express.json());

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
  max-width: 520px;
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
  margin-bottom: 20px;
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
  color: #22c55e;
  font-size: 14px;
}

h1 {
  font-size: 22px;
  margin-top: 20px;
}

.total {
  text-align: center;
  margin: 25px 0;
}

.total span {
  color: gray;
  font-size: 14px;
}

.total h2 {
  font-size: 34px;
  margin: 8px 0;
}

.pay-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 20px;
}

.option {
  padding: 15px;
  border-radius: 14px;
  border: 2px solid #eee;
  cursor: pointer;
  text-align: center;
  font-weight: 600;
  transition: 0.2s;
}

.option:hover {
  border-color: #7c3aed;
  box-shadow: 0 4px 15px rgba(124,58,237,0.2);
}

.option img {
  width: 80px;
  margin-bottom: 10px;
}

.secure {
  text-align: center;
  margin-top: 20px;
  font-size: 13px;
  color: gray;
}
</style>
</head>

<body>

<div class="container">

  <div class="brand">
    <img src="https://i.ibb.co/3Jv3hYH/logo.png">
    <div class="brand-text">
      <h2>SAG & SK</h2>
      <span>✔ Pronosticador verificado</span>
    </div>
  </div>

  <h1>COMBINADA DEL DÍA</h1>

  <div class="total">
    <span>Total a pagar</span>
    <h2>$ 5.000 ARS</h2>
  </div>

  <div class="pay-options">

    <form action="/crear-preferencia" method="POST">
      <button class="option" type="submit" style="all:unset; display:block; width:100%;">
        <div class="option">
          <img src="https://logodownload.org/wp-content/uploads/2019/06/mercado-pago-logo.png">
          MercadoPago
        </div>
      </button>
    </form>

    <form action="/crear-preferencia" method="POST">
      <button class="option" type="submit" style="all:unset; display:block; width:100%;">
        <div class="option">
          <img src="https://logodownload.org/wp-content/uploads/2014/09/visa-logo-1.png">
          Tarjeta
        </div>
      </button>
    </form>

  </div>

  <div class="secure">
    Pago seguro con MercadoPago
  </div>

</div>

</body>
</html>
  `);
});

// =====================
// CREAR PREFERENCIA
// =====================

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
