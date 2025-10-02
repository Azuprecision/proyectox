const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const chromedriver = require('chromedriver');
const geckodriver = require('geckodriver');
const path = require('path');

jest.setTimeout(60000);

// --- Función de ayuda para navegar hasta una sección específica ---
async function navigateToSection(driver, sectionId) {
    const pageUrl = `file://${path.resolve(__dirname, 'vuelos-index.html')}`;
    await driver.get(pageUrl);

    // Flujo rápido para llegar a la sección de pasajeros
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.wait(until.elementLocated(By.css('#flight-list .neon-button-cyan')), 10000);
    await driver.findElement(By.css('#flight-list .neon-button-cyan')).click();
    
    if (sectionId === 'passenger-section') {
        await driver.wait(until.elementLocated(By.id('passenger-section')), 10000);
        return; // Nos detenemos aquí
    }

    // Flujo para llegar a la sección de pago
    await driver.findElement(By.id('name-1')).sendKeys('Pasajero Válido');
    await driver.findElement(By.id('email-1')).sendKeys('valido@example.com');
    await driver.findElement(By.css('#passenger-form button[type="submit"]')).click();
    await driver.wait(until.elementLocated(By.id('payment-section')), 10000);
}


describe('Casos de Prueba Negativos', () => {
    let driver;

    beforeAll(async () => {
        const browser = process.env.BROWSER || 'chrome';
        let builder = new Builder().forBrowser(browser);

        if (browser === 'chrome') {
            let service = new chrome.ServiceBuilder(chromedriver.path);
            builder.setChromeService(service);
        } else if (browser === 'firefox') {
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

    // --- AERO-007: Fallo por nombre de pasajero vacío ---
    it('AERO-007: No debería continuar si el nombre del pasajero está vacío', async () => {
        await navigateToSection(driver, 'passenger-section');

        // Dejar el nombre vacío y solo llenar el email
        await driver.findElement(By.id('email-1')).sendKeys('test@example.com');
        await driver.findElement(By.css('#passenger-form button[type="submit"]')).click();

        // Esperar y aceptar la alerta
        await driver.wait(until.alertIsPresent(), 5000);
        const alert = await driver.switchTo().alert();
        const alertText = await alert.getText();
        
        expect(alertText).toContain('Por favor, completa la información de todos los pasajeros.');
        await alert.accept();

        // Verificar que seguimos en la sección de pasajeros
        const passengerSection = await driver.findElement(By.id('passenger-section'));
        expect(await passengerSection.isDisplayed()).toBe(true);
    });

    // --- AERO-008: Fallo por CVC de tarjeta inválido ---
    it('AERO-008: No debería permitir el pago con un CVC inválido', async () => {
        await navigateToSection(driver, 'payment-section');

        // Llenar el formulario de pago con un CVC inválido
        await driver.findElement(By.id('card-name')).sendKeys('Juan Prueba');
        await driver.findElement(By.id('card-number')).sendKeys('1234567890123456');
        await driver.findElement(By.id('card-expiry')).sendKeys('12/28');
        await driver.findElement(By.id('card-cvc')).sendKeys('ABC'); // CVC inválido
        
        // Intentar pagar
        await driver.findElement(By.css('#payment-form button[type="submit"]')).click();

        // Verificar que la sección de confirmación NO está visible
        const confirmationSection = await driver.findElement(By.id('confirmation-section'));
        expect(await confirmationSection.isDisplayed()).toBe(false);
    });
});
