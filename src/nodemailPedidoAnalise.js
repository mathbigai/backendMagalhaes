const mailer = require("nodemailer");
require("dotenv");

module.exports = (email, nome, celular, cidade, id, valorTotal) => {
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
        to: "vendas.vlh@magalhaesengenharia.com",
        subject: `${nome} solicitou um novo pedido de produtos`,
        html: `Olá Magalhães Engenharia, <br/>
        <b>${nome}</b>, de ${cidade}, solicitou um novo pedido de produtos no valor total de ${valorTotal}. <br/><br/>
        Entre em contato usando as informações a seguir:<br/>
        <li>Email: ${email}</li>
        <li>Celular: ${celular}</li>
        <br/><br/>
        Para mais informações acesso esse <a href='http://magalhaesengenharia.com/admin/pedido-editar/${id}'>link</a>.
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