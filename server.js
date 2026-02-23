const express = require("express");
const { MercadoPagoConfig, Preference } = require("mercadopago");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================================
// CONFIG MERCADOPAGO
// ================================
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

// ================================
// PAGINA PRINCIPAL
// ================================
app.get("/", (req, res) => {
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
text-align:center;
}

.logo{
width:110px;
height:110px;
border-radius:50%;
object-fit:cover;
margin-bottom:20px;
}

h1{margin:10px 0;font-size:30px;}
h2{margin:10px 0 25px;font-size:22px;color:#ccc;}

.price{
font-size:45px;
font-weight:bold;
margin-bottom:25px;
}

.method{
display:flex;
gap:15px;
margin-bottom:25px;
}

.method button{
flex:1;
padding:14px;
border-radius:12px;
border:none;
font-size:16px;
cursor:pointer;
background:#162f4a;
color:white;
}

.method button.active{
border:2px solid #7b4dff;
}

.pay-btn{
width:100%;
padding:18px;
border:none;
border-radius:14px;
font-size:18px;
font-weight:bold;
cursor:pointer;
background:linear-gradient(90deg,#7b4dff,#5f2fff);
color:white;
}

.secure{
margin-top:15px;
color:#aaa;
font-size:14px;
}
</style>
</head>

<body>

<div class="card">

<img src="https://i.ibb.co/N6bp0zVr/tu-logo.jpg" class="logo">

<h1>SAG & SK</h1>
<h2>COMBINADA DEL DÍA</h2>

<div id="price" class="price">$ 5000 ARS</div>

<div class="method">
<button class="active">MercadoPago</button>
<button>Tarjeta</button>
</div>

<form action="/create_preference" method="POST">
<button class="pay-btn">Pagar ahora</button>
</form>

<div class="secure">PAGOS SEGUROS</div>

</div>

<script>

// PRECIO REAL EN ARS
const basePrice = 5000;

// Detectar país automáticamente
fetch("https://ipapi.co/json/")
.then(res => res.json())
.then(data => {

let country = data.country_code;
let priceDiv = document.getElementById("price");

// Conversión visual simple
if(country === "ES"){
priceDiv.innerHTML = "€ 5 EUR";
}
else if(country === "US"){
priceDiv.innerHTML = "$ 6 USD";
}
else if(country === "MX"){
priceDiv.innerHTML = "$ 110 MXN";
}
else{
priceDiv.innerHTML = "$ 5000 ARS";
}

});

</script>

</body>
</html>
`);
});

// ================================
// CREAR PREFERENCIA MERCADOPAGO
// ================================
app.post("/create_preference", async (req, res) => {

  const preference = new Preference(client);

  const result = await preference.create({
    body: {
      items: [
        {
          title: "COMBINADA DEL DÍA - SAG & SK",
          quantity: 1,
          currency_id: "ARS",
          unit_price: 5000,
        },
      ],
      back_urls: {
        success: "https://google.com",
        failure: "https://google.com",
        pending: "https://google.com",
      },
      auto_return: "approved",
    },
  });

  res.redirect(result.init_point);
});

// ================================
// SERVIDOR
// ================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor corriendo"));
