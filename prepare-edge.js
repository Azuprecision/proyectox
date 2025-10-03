const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const extract = require('extract-zip');

const driverDir = path.join(__dirname, '.drivers');
const driverPath = path.join(driverDir, 'msedgedriver.exe');
const version = '129.0.2151.46'; // Actualizar según sea necesario
const url = `https://msedgedriver.azureedge.net/${version}/edgedriver_win64.zip`;
const zipPath = path.join(driverDir, 'edgedriver.zip');

async function prepareEdgeDriver() {
    if (fs.existsSync(driverPath)) {
        console.log('msedgedriver ya existe. Saltando descarga.');
        return;
    }

    console.log(`Descargando msedgedriver desde: ${url}`);
    
    if (!fs.existsSync(driverDir)) {
        fs.mkdirSync(driverDir, { recursive: true });
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error en la descarga: ${response.statusText}`);
        }
        const fileStream = fs.createWriteStream(zipPath);
        await new Promise((resolve, reject) => {
            response.body.pipe(fileStream);
            response.body.on('error', reject);
            fileStream.on('finish', resolve);
        });

        console.log('Descarga completa. Extrayendo archivo...');
        await extract(zipPath, { dir: driverDir });
        
        console.log('Extracción completa. Limpiando...');
        fs.unlinkSync(zipPath);
        
        if (!fs.existsSync(driverPath)) {
            throw new Error('msedgedriver.exe no se encontró después de la extracción.');
        }
        
        console.log('Driver de Edge listo.');

    } catch (error) {
        console.error('Falló la preparación del driver de Edge:', error);
        process.exit(1); // Termina el proceso si el driver no se puede obtener
    }
}

prepareEdgeDriver();
