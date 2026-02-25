const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

app.post("/crear-preferencia", async (req, res) => {
    try {
        const response = await axios.post(
            "https://api.mercadopago.com/checkout/preferences",
            {
                items: [
                    {
                        title: "COMBINADA DEL DÍA",
                        quantity: 1,
                        currency_id: "ARS",
                        unit_price: 5000
                    }
                ]
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );

        res.json({ init_point: response.data.init_point });

    } catch (error) {
        console.log(error.response?.data || error.message);
        res.status(500).send("Error creando preferencia");
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Servidor corriendo");
});
