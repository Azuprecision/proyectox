module.exports = {
  reporters: [
    "default",
    [
      "jest-html-reporters",
      {
        "publicPath": "./html-report",
        "filename": "test-report-[datetime].html",
        "expand": true,
        "pageTitle": "Reporte de Pruebas - AeroNeon",
        "includeAttachments": true
      }
    ]
  ],
  setupFilesAfterEnv: ['./jest.setup.js']
};
