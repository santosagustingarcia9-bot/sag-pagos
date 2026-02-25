const express = require("express");
const { MercadoPagoConfig, Payment } = require("mercadopago");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

const payment = new Payment(client);

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SAG & SK - Payment</title>
<script src="https://sdk.mercadopago.com/js/v2"></script>

<style>
body{
margin:0;
font-family:Arial, sans-serif;
background:#f3f4f6;
display:flex;
justify-content:center;
padding:20px;
}

.container{
max-width:500px;
width:100%;
background:white;
border-radius:20px;
padding:25px;
box-shadow:0 10px 30px rgba(0,0,0,0.1);
}

.header{
display:flex;
align-items:center;
gap:15px;
}

.logo{
width:60px;
height:60px;
border-radius:50%;
object-fit:cover;
}

.title{
font-size:20px;
font-weight:bold;
}

.subtitle{
color:gray;
font-size:14px;
}

.section{
margin-top:20px;
}

.price-box{
background:#f9fafb;
padding:15px;
border-radius:10px;
display:flex;
justify-content:space-between;
font-weight:bold;
}

button{
margin-top:15px;
width:100%;
padding:14px;
border:none;
border-radius:10px;
background:#111827;
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

<div class="container">

<div class="header">
<img src="https://ibb.co/20wwmg12" class="logo">
<div>
<div class="title">SAG & SK</div>
<div class="subtitle">Pronosticador verificado</div>
</div>
</div>

<div class="section">
<h3>STAKE 10 + COMBINADA</h3>
<div class="price-box">
<span>Total</span>
<span>$ 5000 ARS</span>
</div>
</div>

<div class="section">
<h3>Datos de pago</h3>
<div id="cardPaymentBrick_container"></div>
</div>

<div class="result" id="result"></div>

</div>

<script>
const mp = new MercadoPago("${process.env.MP_PUBLIC_KEY}", {
locale: "es-AR"
});

const bricksBuilder = mp.bricks();

bricksBuilder.create("cardPayment", "cardPaymentBrick_container", {
initialization: {
amount: 5000,
},
callbacks: {
onSubmit: async (formData) => {
try{
const response = await fetch("/pagar", {
method:"POST",
headers: {"Content-Type":"application/json"},
body: JSON.stringify(formData)
});

const data = await response.json();

if(data.status === "approved"){
document.getElementById("result").innerText = "✅ Pago aprobado";
}else{
document.getElementById("result").innerText = "❌ Pago rechazado";
}
}catch(e){
document.getElementById("result").innerText = "Error procesando pago";
}
},
onError: error => console.error(error)
}
});
</script>

</body>
</html>
`);
});

app.post("/pagar", async (req, res) => {
try{
const { token, issuer_id, payment_method_id, installments, payer } = req.body;

const response = await payment.create({
body:{
transaction_amount: 5000,
token,
description:"Stake 10 + Combinada",
installments,
payment_method_id,
issuer_id,
payer:{
email: payer.email,
}
}
});

res.json({ status: response.status });

}catch(error){
console.error(error);
res.status(500).json({error:"Error"});
}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log("Servidor funcionando");
});
