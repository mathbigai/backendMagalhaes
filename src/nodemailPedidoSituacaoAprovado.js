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
        to: `issidios@gmail.com`,
        subject: `Seu pedido #${id} teve a situação atualizada`,
        html: `Olá <b>${nome}</b>,<br/>
       Seu pedido #${id} foi aprovado para pagamento.
       Acesse esse <a href='magalhaengenharia.com/loja/pedido/${id}'>link</a> para finalizar seu pedido.
       
       <br/><br/>
       Att.
       A equipe Magalhães Engenharia agradece a preferência.
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