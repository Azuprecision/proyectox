const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const extract = require('extract-zip');
const { execSync } = require('child_process');

const driverDir = path.join(__dirname, '.drivers');
const driverPath = path.join(driverDir, 'msedgedriver.exe');

function getEdgeVersion() {
    try {
        // Comando de PowerShell para obtener la versión del navegador Edge
        const command = "powershell -command \"(Get-Item 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe').VersionInfo.FileVersion\"";
        const version = execSync(command, { encoding: 'utf8' }).trim();
        if (!version) {
            throw new Error('No se pudo determinar la versión de Edge.');
        }
        console.log(`Versión de Microsoft Edge detectada: ${version}`);
        return version;
    } catch (error) {
        console.error('Error al detectar la versión de Edge. Asegúrate de que esté instalado en la ruta estándar.', error);
        return null;
    }
}

async function prepareEdgeDriver() {
    if (fs.existsSync(driverPath)) {
        console.log('msedgedriver ya existe. Saltando descarga.');
        return;
    }

    const version = getEdgeVersion();
    if (!version) {
        process.exit(1);
    }

    const downloadUrl = `https://msedgedriver.microsoft.com/${version}/edgedriver_win64.zip`;
    const zipPath = path.join(driverDir, 'edgedriver.zip');

    console.log(`Descargando msedgedriver v${version} desde: ${downloadUrl}`);
    
    if (!fs.existsSync(driverDir)) {
        fs.mkdirSync(driverDir, { recursive: true });
    }

    try {
        const response = await fetch(downloadUrl);
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
        process.exit(1);
    }
}

prepareEdgeDriver();
