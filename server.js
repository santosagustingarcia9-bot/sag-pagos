const express = require("express");
const mercadopago = require("mercadopago");

const app = express();
app.use(express.json());

mercadopago.configure({
  access_token: process.env.MP_ACCESS
});

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
background:#061a2b;
color:white;
}

.header{
background:linear-gradient(180deg,#0b2d4d,#061a2b);
padding:20px;
display:flex;
justify-content:space-between;
align-items:center;
}

.logo{
display:flex;
align-items:center;
gap:10px;
font-weight:bold;
font-size:20px;
}

.logo img{
width:45px;
height:45px;
border-radius:50%;
object-fit:cover;
}

.container{
padding:20px;
max-width:600px;
margin:auto;
}

.product{
background:#0d2f4f;
border-radius:12px;
padding:15px;
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:20px;
border:2px solid #f5b400;
}

.methods{
display:flex;
gap:15px;
margin-bottom:20px;
}

.method{
flex:1;
background:#102f4a;
border-radius:10px;
padding:15px;
text-align:center;
cursor:pointer;
transition:0.3s;
border:2px solid transparent;
}

.method:hover{
border:2px solid #f5b400;
}

.method img{
width:60px;
margin-bottom:10px;
}

input{
width:100%;
padding:12px;
margin-bottom:15px;
border-radius:8px;
border:none;
}

button{
width:100%;
padding:15px;
background:#1f4f7c;
border:none;
color:white;
font-weight:bold;
font-size:18px;
border-radius:8px;
cursor:pointer;
transition:0.3s;
}

button:hover{
background:#27649c;
}

.footer{
text-align:center;
margin-top:20px;
color:#aaa;
font-size:14px;
}
</style>
</head>

<body>

<div class="header">
  <div class="logo">
    <img src="https://i.ibb.co/N6bp0zVr/logo.jpg">
    SAG & SK
  </div>
</div>

<div class="container">

<div class="product">
  <div>
    <strong>COMBINADA DEL DÍA</strong><br>
    Pronosticador verificado
  </div>
  <div>
    <strong>5000 ARS</strong>
  </div>
</div>

<h3>FORMA DE PAGO</h3>

<div class="methods">
  <div class="method">
    <img src="https://logodownload.org/wp-content/uploads/2019/06/mercado-pago-logo.png">
    MercadoPago
  </div>

  <div class="method">
    <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg">
    Tarjeta
  </div>
</div>

<h3>TUS DATOS</h3>

<input type="text" placeholder="Nombre">
<input type="email" placeholder="Email">
<input type="text" placeholder="Teléfono">

<button onclick="pagar()">COMPRAR AHORA</button>

<div class="footer">
PAGOS SEGUROS
</div>

</div>

<script>
function pagar(){
fetch("/crear-preferencia",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({amount:5000})
})
.then(res=>res.json())
.then(data=>{
window.location.href=data.init_point;
});
}
</script>

</body>
</html>
  `);
});

app.post("/crear-preferencia", async (req,res)=>{
try{
const preference = {
items:[{
title:"COMBINADA DEL DÍA",
quantity:1,
currency_id:"ARS",
unit_price:5000
}],
back_urls:{
success:process.env.BASE_URL,
failure:process.env.BASE_URL,
pending:process.env.BASE_URL
},
auto_return:"approved"
};

const response = await mercadopago.preferences.create(preference);
res.json({init_point:response.body.init_point});

}catch(error){
res.status(500).json({error:error.message});
}
});

app.listen(process.env.PORT || 3000);
