const express = require("express");
const { MercadoPagoConfig, Preference } = require("mercadopago");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔐 VARIABLES
const accessToken = process.env.MP_ACCESS_TOKEN;
const publicKey = process.env.MP_PUBLIC_KEY;

// 🔧 CONFIG MP
const client = new MercadoPagoConfig({
  accessToken: accessToken,
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
<title>SAG & SK - Payment</title>

<script src="https://sdk.mercadopago.com/js/v2"></script>

<style>
body{
  margin:0;
  font-family:Arial,Helvetica,sans-serif;
  background:#f2f2f2;
  display:flex;
  justify-content:center;
  padding:20px;
}

.card{
  width:100%;
  max-width:500px;
  background:white;
  border-radius:20px;
  padding:25px;
  box-shadow:0 10px 40px rgba(0,0,0,0.1);
}

.logo{
  text-align:center;
  margin-bottom:10px;
}

.logo img{
  width:80px;
  height:80px;
  border-radius:50%;
  object-fit:cover;
}

h1{
  text-align:center;
  margin:10px 0 0 0;
}

.subtitle{
  text-align:center;
  color:green;
  margin-bottom:20px;
}

.price{
  background:#f5f5f5;
  padding:15px;
  border-radius:10px;
  display:flex;
  justify-content:space-between;
  font-size:20px;
  font-weight:bold;
  margin-bottom:25px;
}

#paymentBrick_container{
  margin-top:10px;
}
</style>
</head>
<body>

<div class="card">

  <div class="logo">
    <img src="https://i.ibb.co/N6bp0zVr/tu-logo.jpg" />
  </div>

  <h1>SAG & SK</h1>
  <div class="subtitle">Pronosticador verificado</div>

  <div class="price">
    <span>Total</span>
    <span>$ 5000 ARS</span>
  </div>

  <div id="paymentBrick_container"></div>

</div>

<script>
const mp = new MercadoPago("${publicKey}", {
  locale: "es-AR"
});

const bricksBuilder = mp.bricks();

bricksBuilder.create("payment", "paymentBrick_container", {
  initialization: {
    amount: 5000
  },
  customization: {
    visual: {
      style: {
        theme: "default"
      }
    }
  },
  callbacks: {
    onReady: () => {
      console.log("Brick listo");
    },
    onSubmit: async (formData) => {
      try {
        const response = await fetch("/procesar-pago", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });

        const result = await response.json();
        alert("Pago procesado");
        return result;
      } catch (error) {
        alert("Error procesando pago");
      }
    },
    onError: (error) => {
      console.error(error);
    }
  }
});
</script>

</body>
</html>
`);
});


// ===============================
// PROCESAR PAGO
// ===============================
app.post("/procesar-pago", async (req, res) => {
  try {

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            title: "STAKE 10 + COMBINADA",
            quantity: 1,
            unit_price: 5000,
            currency_id: "ARS"
          }
        ]
      }
    });

    res.json({ id: result.id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en pago" });
  }
});


// ===============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor corriendo"));
