const fetch = require('node-fetch');

const LATEST_STABLE_URL = 'https://msedgedriver.microsoft.com/LATEST_STABLE';
const BASE_DOWNLOAD_URL = 'https://msedgedriver.microsoft.com';

async function showDownloadUrl() {
    try {
        console.log('Consultando la última versión estable...');
        const response = await fetch(LATEST_STABLE_URL);
        if (!response.ok) {
            throw new Error(`Error al obtener la versión: ${response.statusText}`);
        }
        const latestVersion = (await response.text()).trim();
        
        const downloadUrl = `${BASE_DOWNLOAD_URL}/${latestVersion}/edgedriver_win64.zip`;
        
        console.log('\n--- URL DE DESCARGA GENERADA ---');
        console.log(downloadUrl);
        console.log('--------------------------------\n');

    } catch (error) {
        console.error('Falló la obtención de la URL:', error);
    }
}

showDownloadUrl();
