const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const chromedriver = require('chromedriver');
const geckodriver = require('geckodriver');
const path = require('path');
const fs = require('fs');

jest.setTimeout(60000);

const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function takeScreenshotAndAttach(driver, testName) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotFileName = `fallo-${testName}-${timestamp}.png`;
    const absoluteScreenshotPath = path.join(screenshotsDir, screenshotFileName);
    const image = await driver.takeScreenshot();
    fs.writeFileSync(absoluteScreenshotPath, image, 'base64');
    
    const reportScreenshotPath = path.join('..', 'screenshots', screenshotFileName);
    
    await addAttach({
        attach: absoluteScreenshotPath,
        description: `Captura del error.`
    });
}

const viewports = {
    mobile: { width: 375, height: 812 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1920, height: 1080 },
};

describe('AERO-005: Tests de Responsividad Cross-Browser', () => {
    let driver;
    const browserName = process.env.BROWSER || 'chrome';

    beforeAll(async () => {
        let builder = new Builder().forBrowser(browserName);
        if (browserName === 'chrome') {
            let service = new chrome.ServiceBuilder(chromedriver.path);
            builder.setChromeService(service);
        } else if (browserName === 'firefox') {
            let service = new firefox.ServiceBuilder(geckodriver.path);
            builder.setFirefoxService(service);
        }
        driver = await builder.build();
    });

    afterAll(async () => {
        if (driver) {
            await driver.quit();
        }
    });

    for (const device in viewports) {
        test(`Debería mostrarse correctamente en vista ${device} [${browserName}]`, async () => {
            try {
                const { width, height } = viewports[device];
                await driver.manage().window().setRect({ width, height });

                const pageUrl = `file://${path.resolve(__dirname, 'vuelos-index.html')}`;
                await driver.get(pageUrl);
                
                const mainContainerLocator = By.css('main.container');
                await driver.wait(until.elementLocated(mainContainerLocator), 10000);
                
                const searchButton = await driver.findElement(By.css('#search-form button[type="submit"]'));
                expect(await searchButton.isDisplayed()).toBe(true);
            } catch (error) {
                await takeScreenshotAndAttach(driver, `responsividad-${device}`);
                throw error;
            }
        });
    }
});