const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {

  const country =
    req.headers["cf-ipcountry"] ||
    req.headers["x-vercel-ip-country"] ||
    "AR";

  const prices = {
    AR: { amount: 5000, currency: "ARS", symbol: "$" },
    US: { amount: 10, currency: "USD", symbol: "$" },
    MX: { amount: 200, currency: "MXN", symbol: "$" },
    ES: { amount: 9, currency: "EUR", symbol: "€" }
  };

  const selected = prices[country] || prices["US"];
  const flag = country.toLowerCase();

  res.send(`
<!DOCTYPE html>
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
  max-width:480px;
  margin:40px auto;
  background:white;
  border-radius:25px;
  padding:35px;
  box-shadow:0 20px 50px rgba(0,0,0,0.08);
  text-align:center;
}

.brand{
  display:flex;
  justify-content:center;
  align-items:center;
  gap:15px;
}

.brand img{
  width:70px;
  height:70px;
  border-radius:50%;
  object-fit:cover;
}

.verified{
  color:#16a34a;
  font-size:14px;
}

.country{
  margin-top:8px;
  font-size:14px;
  color:#555;
}

.flag{
  width:22px;
  vertical-align:middle;
  margin-left:5px;
}

.title{
  font-size:28px;
  font-weight:800;
  margin:25px 0 10px;
}

.price{
  font-size:42px;
  font-weight:900;
  margin-bottom:30px;
}

.methods{
  display:flex;
  gap:15px;
  margin-bottom:30px;
}

.method{
  flex:1;
  padding:20px;
  border:2px solid #e5e7eb;
  border-radius:18px;
  cursor:pointer;
  transition:0.2s;
}

.method.active{
  border-color:#6d28d9;
  background:#f3f0ff;
}

.cards{
  display:flex;
  justify-content:center;
  gap:8px;
  margin-top:8px;
}

.cards img{
  height:22px;
}

.pay-btn{
  width:100%;
  padding:18px;
  border:none;
  border-radius:16px;
  background:linear-gradient(90deg,#6d28d9,#4f46e5);
  color:white;
  font-size:18px;
  font-weight:700;
  cursor:pointer;
  box-shadow:0 10px 25px rgba(99,102,241,0.3);
}

.secure{
  margin-top:18px;
  font-size:14px;
  color:#555;
}
</style>
</head>

<body>

<div class="container">

  <div class="brand">
    <img src="https://i.imgur.com/2DhmtJ4.png">
    <div>
      <div style="font-weight:700;font-size:20px;">SAG & SK</div>
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
      <img src="https://upload.wikimedia.org/wikipedia/commons/3/39/MercadoPago_logo.png" height="28">
      <div style="margin-top:8px;font-weight:600;">MercadoPago</div>
    </div>

    <div class="method" onclick="selectMethod(this)">
      <div style="font-weight:600;">Tarjeta</div>
      <div class="cards">
        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg">
        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg">
        <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg">
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
</html>
`);
});

app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
