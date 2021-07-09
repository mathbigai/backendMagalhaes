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
        Seu pedido #${id} precisa ser averiguado mais de perto, 
        portanto não será possível finalizá-lo neste momento.</br> 
        Mas não se preocupe, logo entraremos em contato com mais informações.
       
       <br/><br/>
       A equipe Magalhães Engenharia agradece a preferência.
       Att.<br/>
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