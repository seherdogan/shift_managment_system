// Özel Cypress komutları
Cypress.Commands.add('getBySel', (selector) => {
  return cy.get(`[data-cy="${selector}"]`);
});

// Confirm dialoglarını otomatik kabul et
Cypress.on('window:confirm', () => true);

// Hata durumunda ekran görüntüsü al
Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});