const { addAttach } = require('jest-html-reporters/helper');

// Hacer la función addAttach disponible globalmente en todas las pruebas
global.addAttach = addAttach;
