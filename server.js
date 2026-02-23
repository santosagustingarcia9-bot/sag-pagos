const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {

  // Detectar país automáticamente
  const country =
    req.headers["cf-ipcountry"] ||
    req.headers["x-vercel-ip-country"] ||
    "AR";

  // Precios por país
  const prices = {
    AR: { amount: 5000, currency: "ARS", symbol: "$" },
    US: { amount: 10, currency: "USD", symbol: "$" },
    MX: { amount: 200, currency: "MXN", symbol: "$" },
    ES: { amount: 9, currency: "EUR", symbol: "€" }
  };

  const selected = prices[country] || prices["US"];
  const flag = country.toLowerCase();

  res.send(`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SAG & SK - Pago</title>

<style>
body{
  margin:0;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  background:#f2f3f7;
}

.container{
  max-width:520px;
  margin:60px auto;
  background:white;
  border-radius:30px;
  padding:40px;
  box-shadow:0 25px 60px rgba(0,0,0,0.08);
  text-align:center;
}

.brand{
  display:flex;
  justify-content:center;
  align-items:center;
  gap:18px;
}

.brand img{
  width:90px;
  height:90px;
  border-radius:50%;
  object-fit:cover;
}

.verified{
  color:#16a34a;
  font-size:15px;
}

.country{
  margin-top:10px;
  font-size:14px;
  color:#666;
}

.flag{
  width:22px;
  margin-left:6px;
}

.title{
  font-size:34px;
  font-weight:900;
  margin:30px 0 15px;
}

.price{
  font-size:52px;
  font-weight:900;
  margin-bottom:35px;
}

.methods{
  display:flex;
  gap:18px;
  margin-bottom:35px;
}

.method{
  flex:1;
  padding:25px;
  border:2px solid #e5e7eb;
  border-radius:22px;
  cursor:pointer;
  transition:0.2s;
}

.method.active{
  border-color:#6d28d9;
  background:#f5f3ff;
}

.method img{
  height:32px;
}

.cards{
  display:flex;
  justify-content:center;
  gap:10px;
  margin-top:10px;
}

.cards img{
  height:28px;
}

.pay-btn{
  width:100%;
  padding:20px;
  border:none;
  border-radius:18px;
  background:linear-gradient(90deg,#6d28d9,#4f46e5);
  color:white;
  font-size:20px;
  font-weight:800;
  cursor:pointer;
  box-shadow:0 12px 30px rgba(99,102,241,0.35);
}

.secure{
  margin-top:20px;
  font-size:15px;
  color:#555;
}
</style>
</head>

<body>

<div class="container">

  <div class="brand">
    <img src="https://i.imgur.com/2DhmtJ4.png">
    <div>
      <div style="font-weight:800;font-size:22px;">SAG & SK</div>
      <div class="verified">✔ Pronosticador verificado</div>
    </div>
  </div>

  <div class="country">
    País detectado: ${country}
    <img class="flag" src="https://flagcdn.com/w40/${flag}.png">
  </div>

  <div class="title">COMBINADA DEL DÍA</div>

  <div class="price">
    ${selected.symbol} ${selected.amount} ${selected.currency}
  </div>

  <div class="methods">

    <div class="method active" onclick="selectMethod(this)">
      <img src="https://logodownload.org/wp-content/uploads/2019/06/mercado-pago-logo.png">
      <div style="margin-top:10px;font-weight:700;">MercadoPago</div>
    </div>

    <div class="method" onclick="selectMethod(this)">
      <div style="font-weight:700;">Tarjeta</div>
      <div class="cards">
        <img src="https://logodownload.org/wp-content/uploads/2014/04/visa-logo-1.png">
        <img src="https://logodownload.org/wp-content/uploads/2014/04/mastercard-logo-2.png">
        <img src="https://logodownload.org/wp-content/uploads/2019/04/american-express-logo.png">
      </div>
    </div>

  </div>

  <button class="pay-btn">Pagar ahora</button>

  <div class="secure">PAGOS SEGUROS</div>

</div>

<script>
function selectMethod(el){
  document.querySelectorAll('.method').forEach(m => m.classList.remove('active'));
  el.classList.add('active');
}
</script>

</body>
</html>`);
});

app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
