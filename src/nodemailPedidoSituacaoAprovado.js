const mailer = require("nodemailer");
require("dotenv");

module.exports = (email, nome, id) => {
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
        to: `${email}`,
        subject: `Seu pedido #${id} teve a situação atualizada`,
        html: `Olá <b>${nome}</b>,<br/>
       Seu pedido foi aprovado para pagamento.</br>
       Acesse esse <a href='magalhaesengenharia.com/loja/pedido/${id}'>link</a> para finalizar seu pedido.
       
       <br/><br/>
       A equipe Magalhães Engenharia agradece a preferência.<br/>
       Att.
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