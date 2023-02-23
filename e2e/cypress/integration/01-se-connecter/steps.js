import {LocalSelectors} from './selectors';
import {LocalMocks} from './mocks';

// enregistre les définitions locales
beforeEach(() => {
  cy.wrap(LocalSelectors).as('LocalSelectors');
  cy.wrap(LocalMocks).as('LocalMocks');
});

Given(
  "j'ouvre le site depuis un lien de réinitialisation du mot de passe",
  () => {
    // génère le lien tel qui sera généré par le back et envoyé par mail (il est
    // difficile de tester la réception de mail directement)
    cy.task('supabase_generateLink', {
      type: 'recovery',
      email: 'yolo@dodo.com',
    }).then(res => {
      // extrait le OTP
      const email_otp = res?.data?.email_otp;
      assert(email_otp, 'OTP non trouvé');

      // crée un lien tel qui doit être reçu par email et visite cette page
      cy.visit(`/auth/recover_landing/${email_otp}`);
    });
  }
);

When('je vais vérifier les données envoyées à la chatbox', () => {
  // attend que le client crisp soit chargé
  cy.window({log: false})
    .its('$crisp')
    // et enregistre un espion pour sa méthode `push`
    .then($crisp => cy.spy($crisp, 'push').as('crisp.push'));
});

When('les données suivantes ont été envoyées à la chatbox :', dataTable => {
  const {nom, prenom, email} = dataTable.rowsHash();
  // vérifie que l'identité de l'utilisateur est associée à la session crisp
  cy.get('@crisp.push').should('be.calledWith', [
    'set',
    'user:nickname',
    [`${prenom} ${nom}`],
  ]);
  cy.get('@crisp.push').should('be.calledWith', ['set', 'user:email', [email]]);
});
