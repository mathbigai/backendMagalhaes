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
        subject: `${nome} realizou o pagamento do pedido #${id}`,
        html: `
        
Olá Magalhães Engenharia, <br/>
        <b>${nome}</b>, realizou o pagamento do pedido #${id} com sucesso. Entre em contato para confirmar os dados de envio do pedido. <br/>
        <br/>        
        Abaixo as informações de contato:<br/>        
        <li>Email: ${email}</li>        
        <li>Celular: ${celular}</li>        
        <br/><br/>        
        Ou acesse este <a href='http://magalhaesengenharia.com/admin/pedido/'>link</a>.
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