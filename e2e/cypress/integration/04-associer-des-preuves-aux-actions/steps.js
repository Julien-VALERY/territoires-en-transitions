/// <reference types="Cypress" />

import { LocalSelectors } from './selectors';
import {
  noPreuvesComplementaires,
  checkPreuvesComplementaires,
  checkPreuvesReglementaires,
} from './checkPreuves';

beforeEach(() => {
  // enregistre les définitions locales
  cy.wrap(LocalSelectors).as('LocalSelectors');
});

When(/je déplie le panneau Preuves de l'action "([^"]+)"/, (action) =>
  getPreuvePanel(action).within(() => {
    // la liste des preuves attendues n'existe pas
    cy.get('[data-test^=preuves]').should('not.exist');
    // clic pour déplier le panneau
    cy.root().click();
    // attend que la liste existe
    cy.get('[data-test^=preuves]').should('be.visible');
  })
);

When(
  /les tables de preuves de la collectivité "(\d+)" sont vides/,
  (collectivite_id) => {
    cy.get('@supabaseClient').then((client) =>
      Promise.all([
        client.from('preuve_reglementaire').delete().match({ collectivite_id }),
        client
          .from('preuve_complementaire')
          .delete()
          .match({ collectivite_id }),
        client.from('preuve_labellisation').delete().match({ collectivite_id }),
        client.from('preuve_rapport').delete().match({ collectivite_id }),
        cy.task('pg_query', {
          query:
            'DELETE FROM labellisation.bibliotheque_fichier WHERE collectivite_id = $1',
          values: [collectivite_id],
        }),
      ])
    );
  }
);

When(
  /la table des preuves complémentaires est initialisée avec les données suivantes/,
  (dataTable) => {
    cy.get('@supabaseClient').then((client) =>
      client.from('preuve_complementaire').insert(dataTable.hashes())
    );
  }
);
When(
  /la table des preuves réglementaires est initialisée avec les données suivantes/,
  (dataTable) => {
    cy.get('@supabaseClient').then((client) =>
      client.from('preuve_reglementaire').insert(dataTable.hashes())
    );
  }
);

When(
  /la liste des preuves complémentaires de la sous-action "([^"]+)" est vide/,
  (action) => {
    noPreuvesComplementaires(getPreuvePanel(action));
  }
);

When(/la liste des preuves complémentaires de l'action est vide/, () => {
  noPreuvesComplementaires(getPreuveTab());
});

When(
  /la liste des preuves complémentaires de la sous-action "([^"]+)" contient les lignes suivantes/,
  (action, dataTable) => {
    checkPreuvesComplementaires(getPreuvePanel(action), dataTable);
  }
);

When(
  /la liste des preuves complémentaires de l'action contient les lignes suivantes/,
  (dataTable) => {
    checkPreuvesComplementaires(getPreuveTab(), dataTable);
  }
);

When(
  /la liste des preuves attendues de la sous-action "([^"]+)" contient les lignes suivantes/,
  (action, dataTable) => {
    checkPreuvesReglementaires(getPreuvePanel(action), dataTable);
  }
);

When(
  /la liste des preuves attendues de l'action contient les lignes suivantes/,
  (dataTable) => {
    checkPreuvesReglementaires(getPreuveTab(), dataTable);
  }
);

When(
  /je clique sur la preuve "([^"]+)" de l'action "([^"]+)"/,
  (preuve, action) => {
    getPreuvePanel(action)
      .find(`[data-test^=preuves] > div`)
      .contains(preuve)
      .click();
  }
);

When(
  /je clique sur le bouton "([^"]+)" de la preuve "([^"]+)" de l'action "([^"]+)"/,
  (btn, preuve, action) => {
    getPreuvePanel(action)
      .find(`[data-test^=preuves] > div`)
      .contains(preuve)
      .parent()
      //      .trigger('mouseover')
      .find(`button[title=${btn}]`)
      .click({ force: true });
  }
);

When(
  /je saisi "([^"]+)" comme commentaire de la preuve "([^"]+)" de l'action "([^"]+)"/,
  (commentaire, preuve, action) => {
    getPreuvePanel(action)
      .find(`[data-test^=preuves] input`)
      .clear()
      .type(commentaire + '{enter}');
  }
);

When(/l'ouverture du lien "([^"]+)" doit avoir été demandée/, (url) => {
  cy.get('@open').should('have.been.calledOnceWithExactly', url);
});

When(
  /clique sur le bouton "Ajouter une preuve" à l'action "([^"]+)"/,
  (action) => {
    // utilise le paramètre "force" pour le clic (sinon il ne se produit jamais ?)
    getAddPreuveButton(action).click({ force: true });
  }
);

When(
  /clique sur le (\d)(?:er|ème) bouton "Ajouter une preuve réglementaire" à l'action "([^"]+)"/,
  (num, action) => {
    // utilise le paramètre "force" pour le clic (sinon il ne se produit jamais ?)
    cy.get(
      `[data-test="preuves-${action}"] [data-test=attendues] [data-test=preuve]:nth(${
        num - 1
      }) [data-test=AddPreuveReglementaire]`
    ).click({ force: true });
  }
);

When(
  /le bouton "Ajouter une preuve" à l'action "([^"]+)" est (visible|absent)/,
  (action, status) => {
    getAddPreuveButton(action).should(
      status === 'visible' ? 'be.visible' : 'not.exist'
    );
  }
);

When(
  "je clique sur le bouton d'ajout d'une preuve complémentaire à l'action",
  () => {
    getPreuveTab().find('[data-test=AddPreuveComplementaire]').click();
  }
);

When(
  /je sélectionne la sous-action "([^"]+)" dans la liste déroulante/,
  (value) => {
    cy.get('[data-test=SelectSubAction]').should('be.visible').click();
    cy.get(`[data-test=SelectSubAction-options] [data-test="${value}"]`)
      .should('be.visible')
      .click();
  }
);

When(/la liste déroulante des sous-actions est visible/, () => {
  cy.get('[data-test=SelectSubAction]').should('be.visible');
});

When(
  "je peux télécharger toutes les preuves sous la forme d'un fichier nommé {string} et contenant les fichiers suivants :",
  (downloadedFile, dataTable) => {
    // chemin du fichier téléchargé
    const downloadsFolder = Cypress.config('downloadsFolder');
    const filename = downloadsFolder + '/' + downloadedFile;

    // fichiers attendus dans l'archive
    const expectedFiles = dataTable.rows();

    // espionne l'url de génération du zip
    cy.intercept('POST', '/zip').as('zip');

    // déclenche la génération du zip
    cy.get(LocalSelectors['Télécharger toutes les preuves'].selector)
      .should('be.enabled')
      .click();

    // attend que la réponse soit reçue
    cy.wait('@zip')
      .its('response')
      .then((response) => {
        // vérifie le code de retour
        expect(response.statusCode).to.eq(200);
        // et le contenu du fichier téléchargé
        return cy.task('validateZip', {
          filename,
          expectedFiles,
          removeAfter: true,
        });
      });
  }
);

const getAddPreuveButton = (action) =>
  getPreuvePanel(action).find('[data-test=AddPreuveComplementaire]');

const getPreuvePanel = (action) =>
  cy.get(`[data-test="PreuvesPanel-${action}"]`);

const getPreuveTab = (action) =>
  cy.get(`[role=tabpanel] [data-test^=preuves-]`).parent();
