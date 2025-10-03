const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const edge = require('selenium-webdriver/edge');
const chromedriver = require('chromedriver');
const geckodriver = require('geckodriver');
const { addAttach } = require('jest-html-reporters/helper');
const path = require('path');
const fs = require('fs');

jest.setTimeout(30000); 

global.addAttach = addAttach;

let driver;
const browserName = process.env.BROWSER || 'chrome';
global.browserName = browserName;

beforeAll(async () => {
  console.log(`Iniciando ${browserName}...`);

  if (browserName === 'firefox') {
    // La forma correcta, que ahora funcionará al eliminar el .cmd conflictivo.
    let service = new firefox.ServiceBuilder(geckodriver.path);
    let options = new firefox.Options();
    
    driver = await new Builder()
      .forBrowser('firefox')
      .setFirefoxService(service)
      .setFirefoxOptions(options)
      .build();

  } else if (browserName === 'edge') {
    const driverPath = path.join(__dirname, '.drivers', 'msedgedriver.exe');
    if (!fs.existsSync(driverPath)) {
      throw new Error(`El driver de Edge no se encontró en ${driverPath}. Ejecuta 'npm run test:edge' para descargarlo.`);
    }
    let service = new edge.ServiceBuilder(driverPath);
    let options = new edge.Options();
    driver = await new Builder()
        .forBrowser('MicrosoftEdge')
        .setEdgeService(service)
        .setEdgeOptions(options)
        .build();
  } else { // chrome
    let service = new chrome.ServiceBuilder(chromedriver.path);
    let options = new chrome.Options();
    
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .setChromeService(service)
      .build();
  }
  
  global.driver = driver;
});

beforeEach(async () => {
  const filePath = path.resolve(__dirname, 'vuelos-index.html');
  const fileUrl = `file://${filePath}`;
  await driver.get(fileUrl);
});

afterAll(async () => {
  if (driver) {
    console.log(`Cerrando ${browserName} después de todas las pruebas.`);
    await driver.quit();
  }
});
