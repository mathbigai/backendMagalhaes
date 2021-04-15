const mailer = require("nodemailer");
require("dotenv");

module.exports = (email, nome, celular, cidade, unidade, valorMedio, anexo, tipoCliente) => {
    const smtpTransport = mailer.createTransport({
        host: 'mail.magalhaesengenharia.com',
        port: 465,
        secure: true, //SSL/TLS
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.PASS_USER
        }
    })
    
    const mail = {
        from: "Site Magalhães Engenharia <noreply@magalhaesengenharia.com>",
        to: "vendas.vlh@magalhaesengenharia.com, vendas1.vlh@magalhaesengenharia.com",
        subject: `${nome} solicitou um novo orçamento`,
        html: `Olá Magalhães Engenharia, unidade de ${unidade} <br/>
        <b>${nome}</b>, de ${cidade}, solicitou um novo orçamento, segue as informações para análise: <br/><br/>
        <li>Tipo de local: ${tipoCliente}</li>
        <li>Valor de consumo médio: ${valorMedio}</li>
        <br/><br/>
        Entre em contato usando as informações a seguir:<br/>
        <li>Email: ${email}</li>
        <li>Celular: ${celular}</li>
        `
    }

    if(anexo){
        console.log(anexo);
        mail.attachments = [];
        mail.attachments.push({
            filename: anexo.originalname,
            content: anexo.buffer
        })
    }
    
    return new Promise((resolve, reject) => {
        smtpTransport.sendMail(mail)
            .then(response => {
                smtpTransport.close();
                return resolve(response);
            })
            .catch(error => {
                smtpTransport.close();
                return reject(error);
            });
    })
}
