const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// PAGINA PRINCIPAL
// ===============================
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SAG & SK - Payment</title>

<style>
body{
  margin:0;
  font-family:Arial;
  background:#f2f2f2;
  display:flex;
  justify-content:center;
  padding:20px;
}

.card{
  width:100%;
  max-width:500px;
  background:white;
  border-radius:20px;
  padding:25px;
  box-shadow:0 10px 30px rgba(0,0,0,0.1);
}

.logo{
  width:90px;
  height:90px;
  border-radius:50%;
  display:block;
  margin:0 auto 10px auto;
}

.title{
  text-align:center;
  font-size:28px;
  font-weight:bold;
}

.verified{
  text-align:center;
  color:green;
  margin-bottom:20px;
}

.total{
  background:#eee;
  padding:15px;
  border-radius:10px;
  display:flex;
  justify-content:space-between;
  font-weight:bold;
  margin-bottom:25px;
}

.section-title{
  font-weight:bold;
  margin-bottom:10px;
}

.payment-options{
  display:flex;
  gap:10px;
  margin-bottom:20px;
}

.payment-btn{
  flex:1;
  padding:12px;
  border-radius:10px;
  border:1px solid #ddd;
  background:#fafafa;
  text-align:center;
  cursor:pointer;
}

.pay-button{
  width:100%;
  padding:15px;
  background:#009ee3;
  color:white;
  border:none;
  border-radius:10px;
  font-size:16px;
  cursor:pointer;
}

.pay-button:hover{
  background:#007dc1;
}

.summary{
  margin-bottom:20px;
  background:#f7f7f7;
  padding:15px;
  border-radius:10px;
}
</style>
</head>

<body>

<div class="card">

<img class="logo" src="https://i.imgur.com/0y0y0y0.png">

<div class="title">SAG & SK</div>
<div class="verified">✔ Pronosticador verificado</div>

<div class="summary">
<div class="section-title">Resumen de compra</div>
<div style="display:flex;justify-content:space-between;">
<span>STAKE 10 + COMBINADA</span>
<span>$ 5000 ARS</span>
</div>
</div>

<div class="total">
<span>Total</span>
<span>$ 5000 ARS</span>
</div>

<div class="section-title">Forma de pago</div>

<div class="payment-options">
<div class="payment-btn">MercadoPago</div>
<div class="payment-btn">Tarjeta</div>
</div>

<form action="/pagar" method="POST">
<button class="pay-button">Pagar ahora</button>
</form>

</div>

</body>
</html>
`);
});


// ===============================
// CREAR PREFERENCIA MERCADOPAGO
// ===============================
app.post("/pagar", async (req, res) => {
  try {

    const response = await axios.post(
      "https://api.mercadopago.com/checkout/preferences",
      {
        items: [
          {
            title: "SAG & SK - Combinada",
            quantity: 1,
            currency_id: "ARS",
            unit_price: 5000
          }
        ],
        back_urls: {
          success: "https://sag-pagos-production.up.railway.app/success",
          failure: "https://sag-pagos-production.up.railway.app/failure",
          pending: "https://sag-pagos-production.up.railway.app/pending"
        },
        auto_return: "approved"
      },
      {
        headers: {
          Authorization: \`Bearer \${process.env.MP_ACCESS_TOKEN}\`,
          "Content-Type": "application/json"
        }
      }
    );

    res.redirect(response.data.init_point);

  } catch (error) {
    console.log(error.response?.data || error.message);
    res.send("Error creando pago");
  }
});


// ===============================
// RESPUESTAS
// ===============================
app.get("/success", (req, res) => {
  res.send("<h1>Pago aprobado ✅</h1>");
});

app.get("/failure", (req, res) => {
  res.send("<h1>Pago rechazado ❌</h1>");
});

app.get("/pending", (req, res) => {
  res.send("<h1>Pago pendiente ⏳</h1>");
});


app.listen(3000, () => {
  console.log("Servidor funcionando en puerto 3000");
});
