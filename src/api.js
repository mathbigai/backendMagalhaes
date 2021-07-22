const http = require('http');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const upload = require("multer");
require("dotenv");
const stripe = require("stripe")(process.env.STRIPE_SECRET_TEST);
const cors = require("cors");
app.use(require("cors")());
app.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res, next) => {
    res.json({ message: "Tudo ok por aqui!" });
})

app.post('/enviarContato', upload().single('anexo'), (req, res) => {
    const nome = req.body.nome;
    const email = req.body.email;
    const comentario = req.body.comentario;
    const celular = req.body.celular;
    const cidade = req.body.cidade;
    const unidade = req.body.unidade;
    require("./nodemail")(email, nome, comentario, celular, cidade, unidade)
        .then(response => res.json(response))
        .catch(error => res.json(error));
})

app.post('/enviarOrcamentoLacerda', upload().single('anexo'), (req, res) => {
    const nome = req.body.nome;
    const email = req.body.email;
    const celular = req.body.celular;
    const cidade = req.body.cidade;
    const unidade = req.body.unidade;
    const valorMedio = req.body.valorMedio;
    const tipoCliente = req.body.tipoCliente;
    const anexo = req.file;
    require("./nodemailLacerda")(email, nome, celular, cidade, unidade, valorMedio, anexo, tipoCliente)
        .then(response => res.json(response))
        .catch(error => res.json(error));
})

app.post('/enviarOrcamentoVilhena', upload().single('anexo'), (req, res) => {
    const nome = req.body.nome;
    const email = req.body.email;
    const celular = req.body.celular;
    const cidade = req.body.cidade;
    const unidade = req.body.unidade;
    const valorMedio = req.body.valorMedio;
    const tipoCliente = req.body.tipoCliente;
    const anexo = req.file;
    require("./nodemailVilhena")(email, nome, celular, cidade, unidade, valorMedio, anexo, tipoCliente)
        .then(response => res.json(response))
        .catch(error => res.json(error));
})

app.post('/enviarPedidoAnalise', upload().single('anexo'), (req, res) => {
    const nome = req.body.nome;
    const email = req.body.email;
    const celular = req.body.celular;
    const cidade = req.body.cidade;
    const valorTotal = req.body.valorTotal;
    require("./nodemailPedidoAnalise")(email, nome, celular, cidade, valorTotal)
        .then(response => res.json(response))
        .catch(error => res.json(error));
})

app.post('/enviarPedidoAprovado', upload().single('anexo'), (req, res) => {
    const nome = req.body.nome;
    const email = req.body.email;
    const id = req.body.id;
    require("./nodemailPedidoSituacaoAprovado")(email, nome, id)
        .then(response => res.json(response))
        .catch(error => res.json(error));
})

app.post('/enviarPedidoReprovado', upload().single('anexo'), (req, res) => {
    const nome = req.body.nome;
    const email = req.body.email;
    const id = req.body.id;
    require("./nodemailPedidoSituacaoReprovado")(email, nome, id)
        .then(response => res.json(response))
        .catch(error => res.json(error));
})

app.post('/enviarPedidoAguardando', upload().single('anexo'), (req, res) => {
    const nome = req.body.nome;
    const email = req.body.email;
    const id = req.body.id;
    require("./nodemailPedidoSituacaoAguardando")(email, nome, id)
        .then(response => res.json(response))
        .catch(error => res.json(error));
})

const monthsFromNow = (n) => {
var d = new Date();
return Math.floor(d.setMonth(d.getMonth() * n) / 1000);
}

app.post("/stripe/charge", cors(), async (req, res) => {
    let { customer, subscription };
    try {
        console.log('criando cliente...')
        customer = await stripe.customer.create({
            email: req.body.email,
            payment_method: req.body.payment_method,
            invoice_settings: {
                default_payment_method: req.body.payment_method
            }
        })
        console.log('cliente criado: ', customer.id)
    } catch (error) {
        console.log(e);
        return res
            .status(422)
            .json({ message: 'Falha ao criar cliente.', details: e })
    }
    try {
        console.log('criando subscrição...')
        subscription = await stripe.subscription.create({
            customer: customer.id,
            cancel_at: monthsFromNow(req.body.installments)
        })
        console.log('subscrição criado: ', subscription.id)
    } catch (error) {
        console.log(e);
        return res
            .status(422)
            .json({ message: 'Falha ao criar subscrição.', details: e })
    }

    res.json(subscription)
})

app.post("/stripe/charge/secret", cors(), async (req, res) => {
    let { amount, description } = req.body;
    try {
        const payment = await stripe.paymentIntents.create({
            amount: amount,
            currency: "BRL",
            payment_method_types: ['boleto', 'card'],
            description: description
        });
        res.json({
            message: "Payment Successful",
            success: true,
            clientSecret: payment.client_secret,
            nextAction: payment.next_action
        });
    } catch (error) {
        res.json({
            message: "Payment Failed",
            success: false,
        });
    }
})

app.post('/webhook', async (req, res) => {
    let data, eventType;

    // Check if webhook signing is configured.
    if (process.env.STRIPE_WEBHOOK_SECRET) {
        // Retrieve the event by verifying the signature using the raw body and secret.
        let event;
        let signature = req.headers['stripe-signature'];
        try {
            event = stripe.webhooks.constructEvent(
                req.rawBody,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.log(`⚠️  Webhook signature verification failed.`);
            return res.sendStatus(400);
        }
        data = event.data;
        eventType = event.type;
    } else {
        // Webhook signing is recommended, but if the secret is not configured in `config.js`,
        // we can retrieve the event data directly from the request body.
        data = req.body.data;
        eventType = req.body.type;
    }

    if (eventType === 'payment_intent.succeeded') {
        // Funds have been captured
        // Fulfill any orders, e-mail receipts, etc
        // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds)
        console.log('💰 Payment captured!');
    } else if (eventType === 'payment_intent.payment_failed') {
        console.log('❌ Payment failed.');
    }
    res.sendStatus(200);
});


const server = http.createServer(app);
server.listen(process.env.PORT || 3030);