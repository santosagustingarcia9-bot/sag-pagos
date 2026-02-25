const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
const MP_PUBLIC_KEY = process.env.MP_PUBLIC_KEY;

app.get("/config", (req, res) => {
  res.json({ publicKey: MP_PUBLIC_KEY });
});

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
  font-family:Arial;
  background:#f4f4f4;
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
  box-shadow:0 10px 40px rgba(0,0,0,0.1);
}
.logo{
  text-align:center;
}
.logo img{
  width:110px;
  border-radius:50%;
}
h1{
  text-align:center;
  margin:10px 0 5px;
}
.verified{
  text-align:center;
  color:#1a8f2e;
  font-weight:bold;
  margin-bottom:20px;
}
.summary{
  margin-bottom:20px;
}
.total{
  background:#eee;
  padding:15px;
  border-radius:10px;
  display:flex;
  justify-content:space-between;
  font-weight:bold;
}
.logos{
  margin-top:15px;
  text-align:center;
}
.logos img{
  height:25px;
  margin:0 5px;
}
.success{
  color:green;
  text-align:center;
  margin-top:15px;
}
.error{
  color:red;
  text-align:center;
  margin-top:15px;
}
</style>
</head>

<body>

<div class="card">

<div class="logo">
<img src="https://i.ibb.co/N6bp0zVr/tu-logo.jpg">
</div>

<h1>SAG & SK</h1>
<div class="verified">✔ Pronosticador verificado</div>

<div class="summary">
<h3>Resumen de compra</h3>
<div class="total">
<span>Stake 10 + Combinada</span>
<span>$ 5000 ARS</span>
</div>
</div>

<div id="paymentBrick_container"></div>

<div class="logos">
<img src="https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/5.21.8/mercadopago/logo__large_plus.png">
<img src="https://img.icons8.com/color/48/visa.png">
<img src="https://img.icons8.com/color/48/mastercard.png">
<img src="https://img.icons8.com/color/48/amex.png">
</div>

<div id="result"></div>

</div>

<script>

async function initPayment() {

  const config = await fetch("/config").then(r => r.json());

  const mp = new MercadoPago(config.publicKey, {
    locale: "es-AR"
  });

  mp.bricks().create("payment", "paymentBrick_container", {
    initialization: {
      amount: 5000
    },
    callbacks: {
      onSubmit: async (cardData) => {

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
          "<div class='error'>Pago rechazado</div>";
        }
      }
    }
  });
}

initPayment();

</script>

</body>
</html>
`);
});

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
          Authorization: \`Bearer \${MP_ACCESS_TOKEN}\`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({ status: response.data.status });

  } catch (error) {
    res.json({ status: "error" });
  }

});

app.listen(process.env.PORT || 3000);
