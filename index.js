const puppeteer = require("puppeteer");
const nodemailer = require("nodemailer");
const file = require("fs");
require("dotenv").config();

async function enviaEmail(){
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

(async () => {
    const url = "https://www.mercadolivre.com.br";
    const search = "controle ps4";

    file.writeFile("./produtos.txt", "Novo arquivo", (error) => {
        return error;
    });
    
    const browser = await puppeteer.launch({headless: "new"});
    const page = await browser.newPage();
    
    await page.goto(url);
    
    await page.waitForSelector(".nav-search-input");
    await page.type(".nav-search-input", search);

    await Promise.all([
        page.waitForNavigation(),
        page.click(".nav-search-btn")
    ]);

    const links = await page.$$eval(".ui-search-link__title-card", (element) => element.map((link) => link.href));
    const editFile = file.createWriteStream("./produtos.txt", {encoding: "utf8"});

    editFile.write(`Resultado da busca por ${search} no ${url}:\n`, (error) => {
        return error;
    })

    for(let link of links){
        await page.goto(link);

        const priceSelector = ".ui-pdp-price__second-line > span > .andes-money-amount > .andes-visually-hidden";

        const name = await page.$eval(".ui-pdp-title", (element) => element.innerText);
        const price = await page.$eval(priceSelector, (element) => element.innerText);
        
        editFile.write(`${name} custa ${price};\n`, "utf8", (error) => {
            return error;
        })
    }

    await browser.close();
    await enviaEmail();
    editFile.end();
})();