const http = require('http');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const upload = require("multer");
require("dotenv");
const stripe = require("stripe")(process.env.STRIPE_SECRET_TEST);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const cors = require("cors");
app.use(require("cors")());
app.use('/webhook', bodyParser.raw({ type: "*/*" }))
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

var admin = require('firebase-admin');

app.get('/', (req, res, next) => {
    res.json({ message: "Tudo ok por aqui!" });
})

admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(Buffer.from(process.env.GOOGLE_CONFIG_BASE64, 'base64').toString('ascii'))),
    databaseURL: "https://magalhaesbd-c856e.firebaseio.com"
});

const firestore = admin.firestore();

const setupForStripeWebhooks = {
    // Because Stripe needs the raw body, we compute it but only when hitting the Stripe callback URL.
    verify: function (req, res, buf) {
        var url = req.originalUrl;
        if (url.startsWith('/webhook')) {
            req.rawBody = buf.toString();
        }
    }
};

app.use(bodyParser.json(setupForStripeWebhooks));


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


app.post("/stripe/charge/secret", cors(), async (req, res) => {
    let { amount, description } = req.body;
    try {
        const payment = await stripe.paymentIntents.create({
            amount: amount,
            currency: "BRL",
            payment_method_types: ['boleto', 'card'],
            description: description,
			expires_after_days: 3
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

app.post('/webhook', (request, response) => {
    const sig = request.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event

    if (event.type === 'charge.succeeded') {
        const session = event.data.object;
        firestore.collection('orders').doc(session.description).update({
            status: 'succeeded'
        });
    }
    if (event.type === 'charge.failed') {
        const session = event.data.object;
        firestore.collection('orders').doc(session.description).update({
            status: 'reprovado'
        });
    }

    // Return a response to acknowledge receipt of the event
    response.json({ received: true });

});


const server = http.createServer(app);
server.listen(process.env.PORT || 3030);