const express = require("express");
const mercadopago = require("mercadopago");

const app = express();
app.use(express.json());

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

const PORT = process.env.PORT || 3000;

// Detectar país simple por IP (fallback Argentina)
function detectarPais(req) {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  if (!ip) return "AR";

  if (ip.includes("190.") || ip.includes("181.") || ip.includes("200.")) {
    return "AR";
  }

  return "US";
}

function obtenerPrecio(country) {
  if (country === "US") {
    return { price: 10, currency: "USD" };
  }
  return { price: 5000, currency: "ARS" };
}

app.get("/", (req, res) => {
  const country = detectarPais(req);
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
  max-width:520px;
  margin:40px auto;
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
  width:70px;
  height:70px;
  border-radius:50%;
}

.brand-text {
  text-align:left;
}

.brand-text h2 {
  margin:0;
  font-size:22px;
}

.verified {
  color:#16a34a;
  font-size:14px;
  margin-top:4px;
}

.title {
  font-size:28px;
  font-weight:800;
  margin:25px 0 10px;
}

.price {
  font-size:42px;
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
  transition:0.2s;
}

.method:hover {
  border-color:#6d28d9;
}

.method img {
  width:50px;
}

.pay-btn {
  width:100%;
  padding:18px;
  border:none;
  border-radius:14px;
  background:linear-gradient(90deg,#6d28d9,#4f46e5);
  color:white;
  font-size:18px;
  font-weight:600;
  cursor:pointer;
}

.secure {
  margin-top:18px;
  color:#666;
  font-size:14px;
}
</style>
</head>

<body>

<div class="container">

  <div class="brand">
    <img src="https://i.imgur.com/3Jv3hYH.png">
    <div class="brand-text">
      <h2>SAG & SK</h2>
      <div class="verified">✔ Pronosticador verificado</div>
    </div>
  </div>

  <div class="title">COMBINADA DEL DÍA</div>

  <div class="price">$ ${price} ${currency}</div>

  <div class="methods">

    <div class="method" onclick="window.location='/crear-preferencia?country=${country}'">
      <img src="https://logodownload.org/wp-content/uploads/2019/06/mercado-pago-logo.png">
      <div style="margin-top:10px;font-weight:600;">MercadoPago</div>
    </div>

    <div class="method" onclick="window.location='/crear-preferencia?country=${country}'">
      <div style="font-weight:600;margin-bottom:10px;">Tarjeta</div>
      <div style="display:flex;justify-content:center;gap:10px;">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/visa/visa-original.svg">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mastercard/mastercard-original.svg">
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
      items: [
        {
          title: "Combinada del Día",
          quantity: 1,
          unit_price: price,
          currency_id: currency,
        },
      ],
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
  console.log("Servidor funcionando en puerto " + PORT);
});
