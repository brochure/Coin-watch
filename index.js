import puppeteer from 'puppeteer';
import open from 'open';
import colors from 'colors';
import { setTimeout } from 'timers';
import { resolve } from 'path';

import CONFIG from './config'
import {get, wait} from './util'

let XCHANGE_RATE_GBP = CONFIG.XCHANGE_RATE_GBP;

const UK = {
    list_url: 'https://bitbargain.co.uk/buy?thing=BTC',
    list_selector: 'body > div.container > table tbody tr:first-child'
}

const XCHANGE_API = {
    url: 'api.fixer.io',
    path: '/latest',
    data: {
        base: 'CNY'
    }
}

async function getUKPrice(page) {
    await page.reload({timeout: 0});

    return await page.evaluate((UK) => {
        let tds = document.querySelector(UK.list_selector).children;
        let str_4 = tds[4].innerText;
        let str_5 = tds[5].innerText;

        return {
            minlot: tds[3].innerText,            
            price: tds[4].innerText.slice(2),
            payment: str_5.slice(2),            
            link: tds[tds.length - 1].children[0].href
        }
    }, UK)
}

console.warn(colors.green('watch on!'));
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    let uk_data, rmb, xchange, rates_data;

    await page.goto(UK.list_url);
    // get bitbargain data
    while(true){
        if(!CONFIG.XCHANGE_RATE_GBP) {
            rates_data = await get(XCHANGE_API)
            XCHANGE_RATE_GBP = 1 / rates_data.rates.GBP;
        } 

        uk_data = await getUKPrice(page);
        rmb = uk_data.price * XCHANGE_RATE_GBP;

        await wait(CONFIG.RATE + 1000 * Math.random());
        console.log(colors.reset(`∆ ${uk_data.minlot} | £${uk_data.payment}, £${uk_data.price}, ¥${rmb.toFixed(2)} | ¥${(rmb*1.04).toFixed(2)}`));
        if(+uk_data.price <= CONFIG.UK_PRICE_LIMIT) {
            console.log(colors.red(`current price is lower than ${CONFIG.UK_PRICE_LIMIT}, open browser`));
            console.log(colors.cyan.underline(`${uk_data.link}`));
            open(uk_data.link);
            break;
        }
    }

    await browser.close();
})();