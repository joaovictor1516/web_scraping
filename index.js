const puppeteer = require("puppeteer");
const nodemailer = require("nodemailer");
const arquivo = require("fs");

const link = "https://www.mercadolivre.com.br";
const search = "controle ps4";
let count = 1;

(async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    
    await page.goto(link);
    
    await page.waitForSelector(".nav-search-input");
    await page.type(".nav-search-input", search);

    await Promise.all([
        page.waitForNavigation(),
        page.click(".nav-search-btn")
    ]);

    const links = await page.$$eval(".ui-search-link__title-card", (link) => link.map((element) => element.href));

    for(let link in links){
        if(count === 9){
            continue;
        }

        await page.goto(link);

        const name = await page.$eval(".ui-pdp-title", (element) => element.innerText);
        console.log(name);

        count ++
    }

    await page.waitForTimeout(2000);
    await browser.close();
})();