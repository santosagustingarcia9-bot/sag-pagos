const express = require("express");
const path = require("path");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// CONFIG MERCADOPAGO
// ===============================
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

// ===============================
// PAGINA PRINCIPAL
// ===============================
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>SAG & SK - Payment</title>
<script src="https://sdk.mercadopago.com/js/v2"></script>
<style>
body{
  margin:0;
  font-family:Arial, sans-serif;
  background:#f3f3f3;
  display:flex;
  justify-content:center;
  padding:20px;
}
.card{
  width:100%;
  max-width:500px;
  background:white;
  border-radius:20px;
  padding:30px;
  box-shadow:0 10px 30px rgba(0,0,0,0.1);
}
.logo{
  text-align:center;
}
.logo img{
  width:120px;
  border-radius:50%;
}
h1{
  text-align:center;
  margin:10px 0 0;
}
.verified{
  text-align:center;
  color:green;
  margin-bottom:20px;
}
.total{
  background:#eee;
  padding:15px;
  border-radius:10px;
  display:flex;
  justify-content:space-between;
  font-weight:bold;
  margin-bottom:20px;
}
#paymentBrick_container{
  margin-top:20px;
}
.success{
  text-align:center;
  color:green;
  font-weight:bold;
  margin-top:20px;
}
</style>
</head>
<body>

<div class="card">

<div class="logo">
<img src="https://i.ibb.co/N6bp0zVr/tu-logo.jpg">
</div>

<h1>SAG & SK</h1>
<div class="verified">Pronosticador verificado</div>

<div class="total">
<span>Total</span>
<span>$ 5000 ARS</span>
</div>

<div id="paymentBrick_container"></div>
<div id="result"></div>

</div>

<script>
const mp = new MercadoPago("${process.env.MP_PUBLIC_KEY}", {
  locale: "es-AR"
});

mp.bricks().create("payment", "paymentBrick_container", {
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
    onSubmit: async (cardData) => {
      try {
        const response = await fetch("/process_payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cardData)
        });

        const result = await response.json();

        if(result.status === "approved"){
          document.getElementById("result").innerHTML =
            "<div class='success'>Pago aprobado correctamente</div>";
        } else {
          document.getElementById("result").innerHTML =
            "<div style='color:red;text-align:center;'>Pago rechazado</div>";
        }

      } catch (error) {
        document.getElementById("result").innerHTML =
          "<div style='color:red;text-align:center;'>Error procesando pago</div>";
      }
    }
  }
});
</script>

</body>
</html>
`);
});

// ===============================
// PROCESAR PAGO REAL
// ===============================
app.post("/process_payment", async (req, res) => {

  try {

    const payment_data = {
      transaction_amount: 5000,
      token: req.body.token,
      description: "SAG & SK - Combinada",
      installments: req.body.installments,
      payment_method_id: req.body.payment_method_id,
      issuer_id: req.body.issuer_id,
      payer: {
        email: req.body.payer.email
      }
    };

    const response = await axios.post(
      "https://api.mercadopago.com/v1/payments",
      payment_data,
      {
        headers: {
          Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({ status: response.data.status });

  } catch (error) {
    res.json({ status: "error" });
  }

});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor funcionando"));
