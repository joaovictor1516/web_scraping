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
            subject: "teste",
            text: "É só um teste"
        });
        console.log("Email enviado", info);
    } catch(error){
        console.error("Erro ao enviar o email", error);
    };
};

(async () => {
    const url = "https://www.mercadolivre.com.br";
    const search = "controle ps4";
    let count = 0;

    file.writeFile("/produtos.txt", `Os ${search} no ${url}`, (error) => {
        return error;
    });
    const editFile = file.createWriteStream("/produtos.txt", {encoding: "utf8"});
    
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    
    await page.goto(url);
    
    await page.waitForSelector(".nav-search-input");
    await page.type(".nav-search-input", search);

    await Promise.all([
        page.waitForNavigation(),
        page.click(".nav-search-btn")
    ]);

    const links = await page.$$eval(".ui-search-link__title-card", (element) => element.map((link) => link.href));

    for(let link of links){
        if(count === 9){
            continue;
        }

        await page.goto(link);

        const priceSelector = ".ui-pdp-price__second-line > span > .andes-money-amount > .andes-visually-hidden";

        const name = await page.$eval(".ui-pdp-title", (element) => element.innerText);
        const price = await page.$eval(priceSelector, (element) => element.innerText);
        console.log(name, price);
        
        editFile.write(`${name} custa ${price}`, "utf8", (error) => {
            return error;
        })

        count++
    }

    await page.waitForTimeout(2000);
    await browser.close();
    await enviaEmail();
    editFile.end();
})();