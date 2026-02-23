const express = require("express");
const mercadopago = require("mercadopago");
const axios = require("axios");

const app = express();
app.use(express.json());

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

const PORT = process.env.PORT || 3000;

// 🔎 Detectar país real por IP
async function detectarPais(ip) {
  try {
    const response = await axios.get(`https://ipapi.co/${ip}/json/`);
    return response.data.country_code || "AR";
  } catch (err) {
    return "AR";
  }
}

function obtenerPrecio(country) {
  if (country === "US") {
    return { price: 10, currency: "USD" };
  }
  if (country === "CL") {
    return { price: 9000, currency: "CLP" };
  }
  return { price: 5000, currency: "ARS" };
}

app.get("/", async (req, res) => {

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress;

  const country = await detectarPais(ip);
  const { price, currency } = obtenerPrecio(country);

  res.send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SAG & SK - Pago</title>

<style>
body {
  margin:0;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  background:#f4f6f9;
}
.container {
  max-width:500px;
  margin:30px auto;
  background:white;
  border-radius:20px;
  padding:30px;
  box-shadow:0 15px 40px rgba(0,0,0,0.08);
  text-align:center;
}
.brand {
  display:flex;
  align-items:center;
  justify-content:center;
  gap:15px;
  margin-bottom:20px;
}
.brand img {
  width:65px;
  height:65px;
  border-radius:50%;
}
.verified {
  color:#16a34a;
  font-size:14px;
}
.title {
  font-size:26px;
  font-weight:800;
  margin:20px 0 10px;
}
.price {
  font-size:38px;
  font-weight:900;
  margin-bottom:25px;
}
.methods {
  display:flex;
  gap:15px;
  margin-bottom:25px;
}
.method {
  flex:1;
  padding:20px;
  border:2px solid #e5e7eb;
  border-radius:16px;
  cursor:pointer;
}
.method img {
  height:28px;
}
.cards {
  display:flex;
  justify-content:center;
  gap:8px;
  margin-top:10px;
}
.pay-btn {
  width:100%;
  padding:16px;
  border:none;
  border-radius:14px;
  background:linear-gradient(90deg,#6d28d9,#4f46e5);
  color:white;
  font-size:17px;
  font-weight:600;
  cursor:pointer;
}
.secure {
  margin-top:15px;
  color:#666;
  font-size:14px;
}
.country {
  font-size:13px;
  color:#888;
  margin-bottom:10px;
}
</style>
</head>

<body>

<div class="container">

  <div class="brand">
    <img src="https://upload.wikimedia.org/wikipedia/commons/4/4f/Iconic_image_of_a_crown.png">
    <div>
      <h2>SAG & SK</h2>
      <div class="verified">✔ Pronosticador verificado</div>
    </div>
  </div>

  <div class="country">
    País detectado: ${country}
  </div>

  <div class="title">COMBINADA DEL DÍA</div>
  <div class="price">$ ${price} ${currency}</div>

  <div class="methods">

    <div class="method" onclick="window.location='/crear-preferencia?country=${country}'">
      <img src="https://logodownload.org/wp-content/uploads/2019/06/mercado-pago-logo.png">
      <div>MercadoPago</div>
    </div>

    <div class="method" onclick="window.location='/crear-preferencia?country=${country}'">
      <div>Tarjeta</div>
      <div class="cards">
        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg">
        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg">
        <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg">
      </div>
    </div>

  </div>

  <button class="pay-btn" onclick="window.location='/crear-preferencia?country=${country}'">
    Pagar ahora
  </button>

  <div class="secure">PAGOS SEGUROS</div>

</div>

</body>
</html>
`);
});

app.get("/crear-preferencia", async (req, res) => {

  const country = req.query.country || "AR";
  const { price, currency } = obtenerPrecio(country);

  try {
    const preference = {
      items: [{
        title: "Combinada del Día",
        quantity: 1,
        unit_price: price,
        currency_id: currency,
      }],
      back_urls: {
        success: process.env.BASE_URL,
      },
    };

    const response = await mercadopago.preferences.create(preference);
    res.redirect(response.body.init_point);

  } catch (error) {
    console.log(error);
    res.send("Error al crear el pago");
  }
});

app.listen(PORT, () => {
  console.log("Servidor funcionando");
});
