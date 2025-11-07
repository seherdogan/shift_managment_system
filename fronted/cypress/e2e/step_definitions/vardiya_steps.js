const { Given, When, Then } = require("@badeball/cypress-cucumber-preprocessor");

// Diyelim ki adımları
Given('vardiya yönetim sistemini açtım', () => {
  cy.visit('/index.html');
  cy.contains('Vardiya Yönetim Sistemi').should('be.visible');
});

Given('çalışanlar sekmesindeyim', () => {
  cy.get('[data-cy="tab-employees"]').should('have.class', 'active');
});

Given('vardiyalar sekmesine geçtim', () => {
  cy.get('[data-cy="tab-shifts"]').click();
  cy.wait(500);
});

// Eğer ki adımları
When('{string} adında {string} pozisyonunda çalışan eklersem', (ad, pozisyon) => {
  cy.get('[data-cy="employee-name-input"]').clear().type(ad);
  cy.get('[data-cy="employee-role-input"]').clear().type(pozisyon);
  cy.get('[data-cy="add-employee-btn"]').click();
  cy.wait(500);
});

When('{string} adlı çalışanı silersem', (ad) => {
  cy.contains('.card', ad).within(() => {
    cy.get('button').contains('Sil').click();
  });
  cy.on('window:confirm', () => true);
  cy.wait(500);
});

When('{string} için {string} tarihinde {string} vardiyası eklersem', (calisan, tarih, vardiyaTipi) => {
  cy.get('[data-cy="shift-employee-select"]').select(calisan);
  cy.get('[data-cy="shift-date-input"]').clear().type(tarih);
  cy.get('[data-cy="shift-type-select"]').select(vardiyaTipi);
  cy.get('[data-cy="add-shift-btn"]').click();
  cy.wait(500);
});

When('ilk vardiyayı silersem', () => {
  cy.get('[data-cy="shifts-list"] .card').first().within(() => {
    cy.get('button').contains('Sil').click();
  });
  cy.on('window:confirm', () => true);
  cy.wait(500);
});

// O zaman adımları
Then('çalışan listesinde {string} görünmeli', (ad) => {
  cy.get('[data-cy="employees-list"]').should('contain', ad);
});

Then('çalışan listesinde {string} görünmemeli', (ad) => {
  cy.get('[data-cy="employees-list"]').should('not.contain', ad);
});

Then('vardiya listesinde {string} için {string} tarihli vardiya görünmeli', (calisan, tarih) => {
  cy.get('[data-cy="shifts-list"]').should('contain', calisan);
  cy.get('[data-cy="shifts-list"]').should('contain', tarih);
});

Then('vardiya sayısı azalmış olmalı', () => {
  cy.get('[data-cy="shifts-list"] .card').should('have.length.lessThan', 4);
});