   exports.config = {
    runner: 'local',
    specs: [
        './*.test.js'
    ],
    maxInstances: 1,
    capabilities: [{
        browserName: 'chrome'
    }],
    logLevel: 'error',
    bail: 0,
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    framework: 'mocha',
    reporters: ['spec'],
    services: ['chromedriver'],
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    }
};
