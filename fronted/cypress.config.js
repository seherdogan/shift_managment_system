const { defineConfig } = require("cypress");
const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");
const preprocessor = require("@badeball/cypress-cucumber-preprocessor");
const createEsbuildPlugin = require("@badeball/cypress-cucumber-preprocessor/esbuild");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:8080",
    specPattern: "cypress/e2e/**/*.feature",
    supportFile: "cypress/support/e2e.js",
    
    // Video ve screenshot ayarları
    video: true,
    videoCompression: 32,
    videosFolder: "cypress/videos",
    videoUploadOnPasses: true,
    screenshotOnRunFailure: true,
    screenshotsFolder: "cypress/screenshots",
    
    // Ekran boyutu
    viewportWidth: 1920,
    viewportHeight: 1080,
    
    // Timeout ayarları
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 60000,
    requestTimeout: 10000,
    responseTimeout: 30000,
    
    // Diğer ayarlar
    watchForFileChanges: false,
    chromeWebSecurity: false,
    experimentalStudio: false,
    
    async setupNodeEvents(on, config) {
      await preprocessor.addCucumberPreprocessorPlugin(on, config);
      
      on("file:preprocessor",
        createBundler({
          plugins: [createEsbuildPlugin.default(config)],
        })
      );
      
      on('before:run', () => {
        console.log(' Testler başlıyor...');
      });
      
      on('after:run', (results) => {
        console.log(' Testler tamamlandı!');
        if (results.totalFailed === 0) {
          console.log(' Tüm testler başarılı!');
        } else {
          console.log(`${results.totalFailed} test başarısız oldu.`);
        }
      });
      
      return config;
    },
  },
});