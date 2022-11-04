/// <reference types="Cypress" />

/**
 * Définitions de "steps" communes à tous les tests
 */

import {Selectors} from './selectors';
import {Expectations} from './expectations';

beforeEach(function () {
  cy.visit('/');
  waitForApp();

  // bouchon pour la fonction window.open
  const stub = cy.stub().as('open');
  cy.on('window:before:load', win => {
    cy.stub(win, 'open').callsFake(stub);
  });
});

// attends que l'appli expose un objet `e2e` permettant de la contrôler, il est
// nécessaire de rappeler cette fonction si on veut que la promesse
// `cy.get('@auth')` soit bien résolue une 2ème fois dans le même scénario
// (utilisée avec le step "je me reconnecte en tant que ...")
function waitForApp() {
  cy.window({log: false}).its('e2e.history').as('history');
  cy.window({log: false}).its('e2e.auth').as('auth');
  cy.window({log: false}).its('e2e.supabaseClient').as('supabaseClient');
}

Given("j'ouvre le site", () => {
  cy.get('[data-test=home]').should('be.visible');
});

const genUser = userName => {
  const letter = userName.slice(1, 2);
  const dd = `d${letter}d${letter}`;
  return {
    email: `${userName}@${dd}.com`,
    password: `${userName}${dd}`,
  };
};

const SignInPage = Selectors['formulaire de connexion'];
Given(/je suis connecté en tant que "([^"]*)"/, login);
function login(userName) {
  const u = genUser(userName);
  cy.get('@auth').then(auth => auth.connect(u));
  cy.get(SignInPage.selector).should('not.exist');
  cy.get('[data-test=connectedMenu]').should('be.visible');
}

Given('je me reconnecte en tant que {string}', function (userName) {
  logout();
  waitForApp();
  login(userName);
});

Given('les discussions sont réinitialisées', () => {
  cy.task('supabase_rpc', {name: 'test_reset_discussion_et_commentaires'});
});

Given('les droits utilisateur sont réinitialisés', () => {
  cy.task('supabase_rpc', {name: 'test_reset_droits'});
});

Given(/l'utilisateur "([^"]*)" est supprimé/, email => {
  cy.task('supabase_rpc', {
    name: 'test_remove_user',
    params: {email: email},
  });
});

Given('les informations des membres sont réinitialisées', () => {
  cy.task('supabase_rpc', {name: 'test_reset_membres'});
});

Given('je me déconnecte', logout);
function logout() {
  cy.get('[data-test=connectedMenu]').click();
  cy.get('[data-test=logoutBtn]').click();
}

// Met en pause le déroulement d'un scénario.
// Associé avec le tag @focus cela permet de debugger facilement les tests.
Given('pause', () => cy.pause());

// utilitaire pour vérifier quelques attentes d'affichage génériques à partir d'une table de correspondances
export const checkExpectation = (selector, expectation, value) => {
  const c = Expectations[expectation];
  if (!c) return;
  if (typeof c === 'object' && c.cond) {
    cy.get(selector).should(c.cond, value || c.value);
  } else if (typeof c === 'function') {
    c(selector, value);
  } else {
    if (selector) {
      cy.get(selector).should(c, value);
    } else {
      cy.root().should(c, value);
    }
  }
};

// renvoi le sélecteur local (ou à défaut le sélecteur global) correspondant à
// un nom d'élément dans la page
export const resolveSelector = (context, elem) => {
  const s = context.LocalSelectors?.[elem] || Selectors[elem];
  assert(s, 'sélecteur non trouvé');
  return s;
};

// on utilise "function" (plutôt qu'une arrow function) pour que "this" donne
// accès au contexte de manière synchrone
// Ref: https://docs.cypress.io/guides/core-concepts/variables-and-aliases#Sharing-Context
Given(/la page vérifie les conditions suivantes/, function (dataTable) {
  const rows = dataTable.rows();
  cy.wrap(rows).each(([elem, expectation, value]) => {
    checkExpectation(resolveSelector(this, elem).selector, expectation, value);
  });
});
Given(
  /le "([^"]*)" vérifie les conditions suivantes/,
  function (parentName, dataTable) {
    const parent = resolveSelector(this, parentName);
    cy.get(parent.selector).within(() => {
      const rows = dataTable.rows();
      cy.wrap(rows).each(([elem, expectation, value]) => {
        checkExpectation(parent.children[elem], expectation, value);
      });
    });
  }
);
Given(/le "([^"]*)" vérifie la condition "([^"]*)"/, verifyExpectation);
Given(/^le "([^"]*)" est ([^"]*)$/, verifyExpectation);
Given(/^le bouton "([^"]*)" est ([^"]*)$/, verifyExpectation);
Given(
  /^le bouton "([^"]*)" du "([^"]*)" est ([^"]*)$/,
  childrenVerifyExpectation
);

function verifyExpectation(elem, expectation) {
  checkExpectation(resolveSelector(this, elem).selector, expectation);
}
function childrenVerifyExpectation(elem, parentName, expectation) {
  const parent = resolveSelector(this, parentName);
  checkExpectation(`${parent.selector} ${parent.children[elem]}`, expectation);
}

function handleClickOnElement(subElement, elem) {
  const parent = resolveSelector(this, elem);
  cy.get(parent.selector).find(parent.children[subElement]).click();
}
Given(/je clique sur le bouton "([^"]*)" du "([^"]*)"/, handleClickOnElement);
Given(/je clique sur l'onglet "([^"]*)" du "([^"]*)"/, handleClickOnElement);
Given(
  /je clique sur le bouton "([^"]*)" de la page "([^"]*)"/,
  handleClickOnElement
);
Given(/^je clique sur le bouton "([^"]*)"$/, function (btnName) {
  cy.get(resolveSelector(this, btnName).selector).click();
});

function fillFormWithValues(elem, dataTable) {
  const parent = resolveSelector(this, elem);
  cy.get(parent.selector).within(() => {
    const rows = dataTable.rows();
    cy.wrap(rows).each(([field, value]) => {
      cy.get(parent.children[field]).clear().type(value);
    });
  });
}
Given(/je remplis le "([^"]*)" avec les valeurs suivantes/, fillFormWithValues);

Given(/l'appel à "([^"]*)" va répondre "([^"]*)"/, function (name, reply) {
  const r = this.LocalMocks?.[name]?.[reply];
  assert(r, 'mock non trouvé');
  cy.intercept(...r).as(name);
});

Given('je clique en dehors de la boîte de dialogue', () =>
  cy.get('body').click(10, 10)
);

Given('je valide le formulaire', () => cy.get('button[type=submit]').click());

const transateTypes = {
  succès: 'success',
  information: 'info',
  erreur: 'error',
};
Given(
  /une alerte de "([^"]*)" est affichée et contient "([^"]*)"/,
  (type, message) => {
    cy.get(`.fr-alert--${transateTypes[type]}`).should('be.visible');
    cy.get(`.fr-alert--${transateTypes[type]}`).should('contain.text', message);
  }
);

Given('je recharge la page', () => {
  cy.reload();
});

// Le tableau des membres est utilisé dans plusieurs tests
// pour valider la modification des informations des membres ou
// les informations de l'utilisateur courant
const tableauMembresSelector = Selectors['tableau des membres'];
Given(
  'le tableau des membres doit contenir les informations suivantes',
  dataTable => {
    cy.get(tableauMembresSelector.selector).within(() => {
      // Attend la disparition du chargement.
      cy.get('[data-test=Loading]').should('not.exist');
      cy.wrap(dataTable.rows()).each(
        (
          [
            nom,
            mail,
            // telephone,
            fonction,
            champ_intervention,
            details_fonction,
            acces,
          ],
          index
        ) => {
          cy.get(`tbody tr:nth(${index})`).within(() => {
            cy.get('td:first').should('contain.text', nom);
            cy.get('td:first').should('contain.text', mail);
            // cy.get('td:nth(1)').should('contain.text', telephone);
            cy.get('td:nth(1)').should('contain.text', fonction);
            cy.get('td:nth(2)').should('contain.text', champ_intervention);
            cy.get('td:nth(3)').should('contain.text', details_fonction);
            cy.get('td:nth(4)').should('contain.text', acces);
          });
        }
      );
    });
  }
);
