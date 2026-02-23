const express = require("express");
const { MercadoPagoConfig, Preference } = require("mercadopago");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// CONFIG MERCADOPAGO
// ===============================
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

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
}

.logo{
  width:90px;
  border-radius:50%;
  margin-bottom:15px;
}

h1{
  margin:0;
}

.price{
  font-size:42px;
  font-weight:bold;
  margin:20px 0;
}

.methods{
  display:flex;
  gap:15px;
  margin-top:20px;
}

.method{
  flex:1;
  background:#ffffff10;
  border-radius:12px;
  padding:15px;
  text-align:center;
  cursor:pointer;
  border:2px solid transparent;
}

.method.active{
  border:2px solid #7b3fe4;
  background:#ffffff20;
}

button{
  margin-top:25px;
  width:100%;
  padding:15px;
  border:none;
  border-radius:12px;
  background:linear-gradient(90deg,#7b3fe4,#5b2fd6);
  color:white;
  font-size:18px;
  cursor:pointer;
}

.secure{
  text-align:center;
  margin-top:15px;
  opacity:0.6;
}
</style>
</head>

<body>
<div class="card">

<img src="https://i.ibb.co/N6bp0zVr/tu-logo.jpg" class="logo">

<h1>SAG & SK</h1>
<h2>COMBINADA DEL DÍA</h2>

<div class="price" id="price">$ 5000 ARS</div>

<div class="methods">
  <div class="method active" onclick="selectMethod(this)">
    MercadoPago
  </div>
  <div class="method" onclick="selectMethod(this)">
    Tarjeta
  </div>
</div>

<button onclick="pagar()">Pagar ahora</button>

<div class="secure">PAGOS SEGUROS</div>

</div>

<script>
function selectMethod(el){
  document.querySelectorAll('.method').forEach(m=>m.classList.remove('active'));
  el.classList.add('active');
}

async function pagar(){
  const response = await fetch("/create_preference", { method: "POST" });
  const data = await response.json();
  window.location.href = data.init_point;
}
</script>

</body>
</html>
  `);
});

// ===============================
// CREAR PREFERENCIA
// ===============================
app.post("/create_preference", async (req, res) => {
  try {
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            title: "COMBINADA DEL DÍA",
            quantity: 1,
            currency_id: "ARS",
            unit_price: 5000,
          },
        ],
      },
    });

    res.json({ init_point: result.init_point });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al crear preferencia");
  }
});

// ===============================
app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor iniciado");
});
