import React, {useState} from 'react';
import {Field, Form, Formik} from 'formik';
import * as Yup from 'yup';
import zxcvbn from 'zxcvbn';
import LabeledTextField from 'ui/forms/LabeledTextField';
import {Link} from 'react-router-dom';
import {
  InscriptionUtilisateur,
  politique_vie_privee,
  registerUser,
} from 'core-logic/api/auth/registration';
import {signInPath} from 'app/paths';
import {Spacer} from 'ui/shared/Spacer';
import {ValiderButton} from 'ui/shared/ValiderButton';
import {PasswordStrengthMeter} from 'ui/forms/PasswordStrengthMeter';

type FormState = 'ready' | 'success' | 'failure';

// certains mots spécifiques du site qui vont faire baisser le score du mdp
const UNSAFE_WORDS = ['ademe', 'tet', 'territoire', 'transition'];

// pour déterminer le score du mot de passe
const getScore = (
  value: string,
  otherValues: InscriptionUtilisateur
): number => {
  // les autres valeurs du formulaire sont également prises en compte dans le score
  const {email, nom, prenom} = otherValues || {};
  const userInputs = [email, nom, prenom, ...UNSAFE_WORDS];
  return zxcvbn(value, userInputs).score;
};

/**
 * The user registration form.
 */
const RegistrationForm = () => {
  const [state, setState] = useState<FormState>('ready');
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (state === 'failure') {
    return (
      <section className="max-w-2xl mx-auto p-5 text-center">
        <Spacer />
        <p>Le compte n'a pas pu être créé... </p>
        {errorMessage && <p>{errorMessage}</p>}
        {!errorMessage && <p>Erreur indéterminée</p>}
        <Spacer />
      </section>
    );
  } else if (state === 'success') {
    return (
      <section className="max-w-2xl mx-auto p-5 text-center">
        <Spacer />
        <p>Votre compte a bien été créé ! </p>
        <Spacer />
        <div>
          <Link to={signInPath} className="fr-btn">
            Se connecter
          </Link>
        </div>
      </section>
    );
  }

  const initialData: InscriptionUtilisateur = {
    email: '',
    nom: '',
    prenom: '',
    password: '',
    vie_privee_conditions: false,
  };

  const validation = Yup.object({
    email: Yup.string()
      .email("Cette adresse email n'est pas valide")
      .required('Champ requis'),
    nom: Yup.string()
      .max(300, 'Ce champ doit faire au maximum 300 caractères')
      .required('Champ requis'),
    prenom: Yup.string()
      .max(300, 'Ce champ doit faire au maximum 300 caractères')
      .required('Champ requis'),
    password: Yup.string()
      .min(8, 'Ce champ doit faire au minimum 8 caractères')
      .max(300, 'Ce champ doit faire au maximum 300 caractères')
      .test(
        'is-robust',
        'Ce mot de passe est trop simple',
        (value, context) => !value || getScore(value, context.parent) > 3
      )
      .required('Champ requis'),
    vie_privee_conditions: Yup.boolean().isTrue('Champ requis'),
  });

  const register = (data: InscriptionUtilisateur) => {
    registerUser(data)
      .then(() => {
        setState('success');
      })
      .catch(reason => {
        setState('failure');
        setErrorMessage(`${reason}`);
      });
  };

  return (
    <section className="max-w-2xl mx-auto p-5">
      <Spacer />
      <h2 className="fr-h2 flex justify-center">Créer un compte</h2>
      <div className="mx-auto">
        <Formik<InscriptionUtilisateur>
          initialValues={initialData}
          validationSchema={validation}
          onSubmit={register}
        >
          {({errors, touched, values}) => {
            const score = getScore(values.password, values);

            return (
              <Form>
                <Field
                  name="email"
                  label="Email"
                  component={LabeledTextField}
                />
                <Spacer size={2} />
                <Field
                  name="password"
                  label="Mot de passe"
                  type="password"
                  component={LabeledTextField}
                />
                {score > 0 && (
                  <PasswordStrengthMeter score={score} className="pt-2" />
                )}
                <Spacer size={2} />
                <Field
                  name="prenom"
                  label="Prénom"
                  component={LabeledTextField}
                />
                <Spacer size={2} />
                <Field name="nom" label="Nom" component={LabeledTextField} />
                <Spacer size={2} />
                <label className="cgu">
                  {errors.vie_privee_conditions &&
                    touched.vie_privee_conditions && (
                      <div className="mb-2 text-sm opacity-80 text-red-500">
                        L'acceptation de la politique de protection des données
                        à caractère personnel est nécessaire pour créer un
                        compte.
                      </div>
                    )}
                  <Field type="checkbox" name="vie_privee_conditions" />
                  <span className="ml-2">
                    J'accepte la{' '}
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      className=" text-blue-600"
                      href={politique_vie_privee}
                    >
                      politique de protection des données à caractère personnel
                      de l'ADEME
                    </a>
                  </span>{' '}
                </label>
                <Spacer size={2} />
                <div className="max-w-2xl flex flex-row-reverse">
                  <ValiderButton />
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </section>
  );
};

export default RegistrationForm;
