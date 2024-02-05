const puppeteer = require("puppeteer");
const file = require("fs");
const enviaEmail = require("./enviaEmail.js");

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

        const name = await page.$eval(".ui-pdp-title", (element) => element.innerText);
        const price = await page.$eval("[itemprop='price']", (element) => element.content);
        
        editFile.write(`${name} custa ${price};\n`, "utf8", (error) => {
            return error;
        })
    }

    await browser.close();
    await enviaEmail();
    editFile.end();
})();