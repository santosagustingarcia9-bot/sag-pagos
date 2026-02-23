const express = require("express");
const { MercadoPagoConfig, Payment } = require("mercadopago");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CONFIG MERCADOPAGO
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

const payment = new Payment(client);

// =============================
// PAGINA PRINCIPAL
// =============================
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SAG & SK - Pago</title>

<script src="https://sdk.mercadopago.com/js/v2"></script>

<style>
body{
margin:0;
font-family:Arial, Helvetica, sans-serif;
background:#071a2c;
color:white;
display:flex;
justify-content:center;
padding:20px;
}
.card{
max-width:520px;
width:100%;
background:#0d2740;
border-radius:20px;
padding:30px;
box-shadow:0 20px 50px rgba(0,0,0,0.4);
}
h1{text-align:center;}
.price{
font-size:40px;
text-align:center;
margin:20px 0;
}
input,select{
width:100%;
padding:12px;
margin-bottom:12px;
border-radius:10px;
border:none;
}
button{
width:100%;
padding:15px;
background:linear-gradient(90deg,#6d3df5,#9f5cff);
border:none;
border-radius:12px;
color:white;
font-size:16px;
cursor:pointer;
}
.result{
margin-top:15px;
text-align:center;
font-weight:bold;
}
</style>
</head>
<body>

<div class="card">
<h1>SAG & SK</h1>
<div class="price">$ 5000 ARS</div>

<form id="paymentForm">
<input type="text" id="cardholderName" placeholder="Nombre del titular" required>
<input type="email" id="email" placeholder="Email" required>

<div id="cardNumber"></div>
<div id="expirationDate"></div>
<div id="securityCode"></div>
<div id="issuer"></div>
<div id="installments"></div>

<button type="submit">Pagar ahora</button>
</form>

<div class="result" id="result"></div>

</div>

<script>
const mp = new MercadoPago("${process.env.MP_PUBLIC_KEY}", {
locale: "es-AR"
});

const bricksBuilder = mp.bricks();

const renderCardPaymentBrick = async () => {
await bricksBuilder.create("cardPayment", "cardNumber", {
initialization: {
amount: 5000,
payer: { email: "" },
},
callbacks: {
onSubmit: async (cardFormData) => {
try {
const response = await fetch("/pagar", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(cardFormData),
});
const result = await response.json();

if(result.status === "approved"){
document.getElementById("result").innerText = "✅ Pago aprobado";
}else{
document.getElementById("result").innerText = "❌ Pago rechazado";
}

} catch (error) {
document.getElementById("result").innerText = "Error procesando pago";
}
},
onError: (error) => console.error(error),
},
});
};

renderCardPaymentBrick();
</script>

</body>
</html>
`);
});

// =============================
// ENDPOINT PAGAR
// =============================
app.post("/pagar", async (req, res) => {
try {
const { token, issuer_id, payment_method_id, transaction_amount, installments, payer } = req.body;

const response = await payment.create({
body: {
transaction_amount: 5000,
token,
description: "Combinada del día",
installments,
payment_method_id,
issuer_id,
payer: {
email: payer.email,
},
},
});

res.json({ status: response.status });

} catch (error) {
console.error(error);
res.status(500).json({ error: "Error al procesar pago" });
}
});

// PUERTO
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log("Servidor funcionando en puerto " + PORT);
});
