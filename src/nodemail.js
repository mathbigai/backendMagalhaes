const mailer = require("nodemailer");
require("dotenv");

module.exports = (email, nome, comentario, celular, cidade, unidade) => {
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
        to: "engenharia@magalhaesengenharia.com",
        subject: `${nome} te enviou uma mensagem`,
        html: `Olá Magalhães Engenharia, unidade de ${unidade} <br/>
        <b>${nome}</b>, de ${cidade}, deixou uma nova mensagem: <br/><br/>
        ${comentario}<br/><br/>
        Entre em contato usando as informações a seguir:<br/>
        <li>Email: ${email}</li>
        <li>Celular: ${celular}</li>
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