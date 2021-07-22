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

app.post('/webhooks', (req, res) => {
    try {
        const webhookEndpoint = await stripe.webhookEndpoints.create({
            url: 'https://magalhaesbackend.herokuapp.com/webhooks',
            enabled_events: [
              'charge.failed',
              'charge.succeeded',
            ],
          });
          res.json({
            message: "Payment Successful",
            success: true,
        });
        console.log(webhookEndpoint)
    } catch (error) {
        res.json({
            message: "Payment Failed",
            success: false,
        });
    }
  })


const server = http.createServer(app);
server.listen(process.env.PORT || 3030);