const mailer = require("nodemailer");
require("dotenv");

module.exports = (email, nome, celular, cidade, valorTotal) => {
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
        to: "issidios@gmail.com",
        subject: `${nome} solicitou um novo pedido de produtos`,
        html: `
        
Olá Magalhães Engenharia, <br/>
        
<b>${nome}</b>, de ${cidade}, solicitou um novo pedido de produtos no valor total de R$ ${valorTotal}. <br/><br/>        
        
        Abaixo as informações de contato:<br/>        
        
        <li>Email: ${email}</li>        
        <li>Celular: ${celular}</li>        
        <br/><br/>        
        Para analisar o pedido mais de perto, acesso este <a href='http://magalhaesengenharia.com/admin/pedido/'>link</a>.
        `
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