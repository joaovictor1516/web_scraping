const puppeteer = require("puppeteer");
const nodemailer = require("nodemailer");
const arquivo = require("fs");

const url = "https://www.mercadolivre.com.br";
const search = "controle ps4";
let count = 0;

(async () => {
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

        count++
    }

    await page.waitForTimeout(2000);
    await browser.close();
})();