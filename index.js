const puppeteer = require('puppeteer');
const nexus = puppeteer.devices['Nexus 5'];
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).array("names").argv

//velocità media https://www.speedtest.net/global-index

function creaStatistica(somma, iterazioni, misurazioni) {
    var media = somma / iterazioni;
    var devStandard = 0;

    misurazioni.forEach(function(el) {
        devStandard += Math.pow(el - media, 2)
    })

    return {
        iterazioni,
        'numero di marker': misurazioni.length,
        media: Math.floor(media),
        moda: Math.floor(Math.max(...misurazioni)),
        mediana: Math.floor(misurazioni.sort()[Math.floor(iterazioni / 2)]),
        minimo: Math.floor(Math.min(...misurazioni)),
        'deviazione standard': Math.floor(Math.sqrt(devStandard / iterazioni))
    }
}

async function main() {
    const browser = await puppeteer.launch({ headless: argv.headless || false, args: [`--window-size=1920,1080`] });
    const avgFixed = {
        download: ((argv.dw || 110.24) * 1000 * 1000) / 8,
        upload: ((argv.up || 60.13) * 1000 * 1000) / 8,
        latency: argv.lt || 19,
    }
    var log = [];
    const iterazioni = argv.i || 50;
    var res = [];

    for (i = 0; i < iterazioni; i++) {
        const page = await browser.newPage();
        await page.emulateNetworkConditions(avgFixed)
        await page.emulateCPUThrottling(argv.cpu || 1);
        page.setCacheEnabled(false);
        if (argv.nexus == true) {
            await page.emulate(nexus);
        } else {
            await page.setViewport({
                width: argv.w || 1920,
                height: argv.h || 1080,
                deviceScaleFactor: 1,
                isMobile: argv.mobile || false,
            });
        }

        page.on('console', function(msg) { try { log.push(JSON.parse(msg.text())); } catch {
                (argv.v == true) && console.log(msg.text()) } });
        await page.goto(argv.url);
        await page.waitForSelector('#carico');

        page.close();
    }
    browser.close();

    console.log(`result for ${argv.url}`);
    argv.names.forEach((item, i) => {
        var sum = 0;
        var starts = [];
        log.forEach(function(el) {
            if (el.name == item) {
                starts.push((el.duration == 0) ? el.startTime : el.duration)
                sum += (el.duration == 0) ? el.startTime : el.duration
            }
        })
        console.log(`index ${i} for ${item}`)
        res.push(creaStatistica(sum, iterazioni, starts))
    });
    console.table(res);
}

main()