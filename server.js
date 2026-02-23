const express = require("express");
const mercadopago = require("mercadopago");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CONFIG MERCADOPAGO
mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});

// VARIABLES TELEGRAM
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

// PAGINA PRINCIPAL
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<title>SAG & SK - Pago</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>

body{
margin:0;
font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
background:#f4f6f8;
}

.container{
max-width:500px;
margin:40px auto;
background:white;
border-radius:25px;
padding:30px;
box-shadow:0 15px 40px rgba(0,0,0,0.08);
}

.brand{
display:flex;
align-items:center;
gap:15px;
margin-bottom:25px;
}

.brand img{
width:70px;
height:70px;
border-radius:50%;
object-fit:cover;
}

.brand-info h2{
margin:0;
font-size:22px;
font-weight:800;
}

.brand-info span{
color:#16a34a;
font-size:14px;
}

h1{
font-size:26px;
margin:20px 0 10px 0;
}

.price{
font-size:32px;
font-weight:900;
margin-bottom:25px;
}

.pay-options{
display:grid;
grid-template-columns:1fr 1fr;
gap:15px;
margin-bottom:25px;
}

.pay-box{
border:1px solid #eee;
padding:15px;
border-radius:15px;
text-align:center;
font-weight:600;
background:#fafafa;
}

.pay-box img{
height:22px;
margin-top:5px;
}

input{
width:100%;
padding:15px;
border-radius:12px;
border:1px solid #ddd;
margin-bottom:20px;
font-size:16px;
}

button{
width:100%;
padding:18px;
border:none;
border-radius:14px;
font-size:18px;
font-weight:600;
color:white;
cursor:pointer;
background:linear-gradient(90deg,#6366f1,#7c3aed);
}

button:hover{
opacity:0.9;
}

.secure{
text-align:center;
margin-top:15px;
color:#777;
font-size:14px;
}

</style>
</head>

<body>

<div class="container">

<div class="brand">
<img src="https://i.imgur.com/4M34hi2.png">
<div class="brand-info">
<h2>SAG & SK</h2>
<span>✔ Pronosticador verificado</span>
</div>
</div>

<h1>STAKE 10 + COMBINADA</h1>
<div class="price">$ 5.000 ARS</div>

<div class="pay-options">
<div class="pay-box">
MercadoPago<br>
<img src="https://upload.wikimedia.org/wikipedia/commons/b/b3/MercadoPago_Logo.png">
</div>

<div class="pay-box">
Tarjeta Internacional<br>
<img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg">
<img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg">
</div>
</div>

<form action="/crear-preferencia" method="POST">
<input type="text" name="nombre" placeholder="Tu nombre completo" required>
<button type="submit">Pagar ahora</button>
</form>

<div class="secure">
Pago seguro procesado por MercadoPago
</div>

</div>

</body>
</html>
`);
});

// CREAR PREFERENCIA
app.post("/crear-preferencia", async (req, res) => {

  const { nombre } = req.body;

  const preference = {
    items: [
      {
        title: "Stake 10 + Combinada",
        quantity: 1,
        unit_price: 5000
      }
    ],
    back_urls: {
      success: process.env.BASE_URL + "/success",
      failure: process.env.BASE_URL + "/failure"
    },
    auto_return: "approved",
    notification_url: process.env.BASE_URL + "/webhook",
    metadata: {
      nombre: nombre
    }
  };

  try {
    const response = await mercadopago.preferences.create(preference);
    res.redirect(response.body.init_point);
  } catch (error) {
    console.log(error);
    res.send("Error al crear pago");
  }
});

// WEBHOOK MERCADOPAGO
app.post("/webhook", async (req, res) => {

  if (req.body.type === "payment") {
    const paymentId = req.body.data.id;

    try {
      const payment = await mercadopago.payment.findById(paymentId);

      if (payment.body.status === "approved") {

        const nombre = payment.body.metadata.nombre;

        // GENERAR LINK DE INVITACION TELEGRAM
        const invite = await axios.post(
          \`https://api.telegram.org/bot\${TELEGRAM_TOKEN}/createChatInviteLink\`,
          {
            chat_id: CHANNEL_ID,
            member_limit: 1
          }
        );

        const link = invite.data.result.invite_link;

        // ENVIAR MENSAJE AL CANAL
        await axios.post(
          \`https://api.telegram.org/bot\${TELEGRAM_TOKEN}/sendMessage\`,
          {
            chat_id: CHANNEL_ID,
            text: "Nuevo pago aprobado de: " + nombre
          }
        );

      }

    } catch (error) {
      console.log(error);
    }
  }

  res.sendStatus(200);
});

app.get("/success", (req, res) => {
  res.send("Pago aprobado ✅ Revisa tu Telegram.");
});

app.get("/failure", (req, res) => {
  res.send("Pago cancelado ❌");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
