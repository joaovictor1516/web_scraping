const nodemailer = require("nodemailer");
require("dotenv").config();

module.exports = async function enviaEmail(){
    const emailAddress = process.env.emailAddress;
    const emailPassword = process.env.emailPassword;
    
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { 
            user: emailAddress, 
            pass: emailPassword 
        }
    });

    try{
        const info = await transporter.sendMail({
            from: `"Jao 👨🏽‍💻" <${emailAddress}>`,
            to: "jvdecampos@hotmail.com",
            subject: "Arquivo com os produtos",
            attachments: [{
                filename: 'produtos.txt',
                path: './produtos.txt'
            }],
            text: "Arquivo com o resultado da busca"
        });
        console.log("Email enviado", info);
    } catch(error){
        console.error("Erro ao enviar o email", error);
    };
};

// module.exports = enviaEmail;