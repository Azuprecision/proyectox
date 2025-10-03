const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const chromedriver = require('chromedriver');
const geckodriver = require('geckodriver');
const path = require('path');
const fs = require('fs');
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });

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
    desktop: { width: 1920, height: 1080 },
};

describe('AERO-006: Tests de Regresión Visual', () => {
    let driver;
    const browserName = process.env.BROWSER || 'chrome';

    beforeAll(async () => {
        let builder = new Builder().forBrowser(browserName);

        if (browserName === 'chrome') {
            let service = new chrome.ServiceBuilder(chromedriver.path);
            builder.setChromeService(service).setChromeOptions(new chrome.Options().addArguments('--headless'));
        } else if (browserName === 'firefox') {
            let service = new firefox.ServiceBuilder(geckodriver.path);
            builder.setFirefoxService(service).setFirefoxOptions(new firefox.Options().addArguments('--headless'));
        }
        
        driver = await builder.build();
    });

    afterAll(async () => {
        if (driver) {
            await driver.quit();
        }
    });

    for (const device in viewports) {
        test(`La página principal debería coincidir con el snapshot en vista ${device} [${browserName}]`, async () => {
            try {
                const { width, height } = viewports[device];
                await driver.manage().window().setRect({ width, height });
                
                const pageUrl = `file://${path.resolve(__dirname, 'vuelos-index.html')}`;
                await driver.get(pageUrl);
                
                await driver.wait(until.elementLocated(By.id('search-form')), 10000);
                
                const screenshot = await driver.takeScreenshot();
                expect(screenshot).toMatchImageSnapshot({
                    customSnapshotIdentifier: `${browserName}-${device}-view`,
                    failureThreshold: 0.1,
                    failureThresholdType: 'percent'
                });
            } catch (error) {
                await takeScreenshotAndAttach(driver, `visual-${device}`);
                throw error;
            }
        });
    }
});
