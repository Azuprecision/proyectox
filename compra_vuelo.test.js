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

describe('Flujo de Compra de Vuelos en AeroNeon', () => {
    it('Debería completar el flujo de compra de un vuelo', async () => {
        try {
            const pageUrl = `file://${path.resolve(__dirname, 'vuelos-index.html')}`;
            await driver.get(pageUrl);

            const roundTripLocator = By.css('label[for="round-trip"]');
            await driver.wait(until.elementLocated(roundTripLocator), 10000);
            await driver.findElement(roundTripLocator).click();

            await driver.findElement(By.id('origin')).sendKeys('Ciudad de México (MEX)');
            await driver.findElement(By.id('destination')).sendKeys('Cancún (CUN)');

            const today = new Date();
            const departureDate = new Date(today);
            departureDate.setDate(today.getDate() + 5);
            const returnDate = new Date(departureDate);
            returnDate.setDate(departureDate.getDate() + 7);
            const formatDate = (date) => date.toISOString().split('T')[0];

            await driver.executeScript(`document.getElementById('departure-date')._flatpickr.setDate('${formatDate(departureDate)}')`);
            await driver.executeScript(`document.getElementById('return-date')._flatpickr.setDate('${formatDate(returnDate)}')`);

            await driver.findElement(By.css('button[type="submit"]')).click();

            const selectButtonLocator = By.css('#flight-list .neon-button-cyan');
            await driver.wait(until.elementLocated(selectButtonLocator), 10000);
            await driver.findElement(selectButtonLocator).click();

            const passengerSectionLocator = By.id('passenger-section');
            await driver.wait(until.elementLocated(passengerSectionLocator), 10000);
            await driver.findElement(By.id('name-1')).sendKeys('Juan Prueba');
            await driver.findElement(By.id('email-1')).sendKeys('juan.prueba@example.com');
            await driver.findElement(By.css('#passenger-form button[type="submit"]')).click();

            const paymentSectionLocator = By.id('payment-section');
            await driver.wait(until.elementLocated(paymentSectionLocator), 10000);
            await driver.findElement(By.id('card-name')).sendKeys('Juan Prueba');
            await driver.findElement(By.id('card-number')).sendKeys('1234567890123456');
            await driver.findElement(By.id('card-expiry')).sendKeys('12/28');
            await driver.findElement(By.id('card-cvc')).sendKeys('123');
            await driver.findElement(By.css('#payment-form button[type="submit"]')).click();

            const confirmationTitleLocator = By.css('#confirmation-section h2');
            await driver.wait(until.elementLocated(confirmationTitleLocator), 10000);
            await driver.wait(until.elementIsVisible(driver.findElement(confirmationTitleLocator)), 10000);
            const confirmationTitle = await driver.findElement(confirmationTitleLocator).getText();
            
            expect(confirmationTitle).toBe('¡Compra Exitosa!');
        } catch (error) {
            await takeScreenshotAndAttach(driver, 'compra-vuelo');
            throw error;
        }
    });
});