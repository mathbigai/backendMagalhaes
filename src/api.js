const http = require('http'); 
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const upload = require("multer");

app.use(require("cors")());
app.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({extended: true}))

app.get('/', (req, res, next) => {
    res.json({message: "Tudo ok por aqui!"});
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


const server = http.createServer(app); 
server.listen(process.env.PORT || 3030);