# Proyecto AeroNeon

Este proyecto contiene una aplicación web de demostración para la reserva de vuelos (AeroNeon) y un conjunto de pruebas automatizadas construidas con Selenium y Jest.

## Instalación

Antes de ejecutar las pruebas, asegúrate de tener Node.js instalado. Luego, instala las dependencias del proyecto:

```bash
npm install
```

## Ejecución de Pruebas

Puedes ejecutar el conjunto completo de pruebas o especificarlas por navegador.

### Ejecutar todas las pruebas (usando Chrome por defecto)

```bash
npm test
```

### Ejecutar pruebas en un navegador específico

**Para Chrome:**
```bash
npm run test:chrome
```

**Para Firefox:**
```bash
npm run test:firefox
```

### Reportes

Después de cada ejecución, se genera un reporte HTML detallado en la carpeta `/html-report`.