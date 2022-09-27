import {useState} from 'react';
import {Field, Form, Formik, FormikHandlers} from 'formik';
import * as Yup from 'yup';

import Modal from 'ui/shared/floating-ui/Modal';
import FormInput from 'ui/shared/form/FormInput';

import {useAuth, UserData} from 'core-logic/api/auth/AuthProvider';
import {useUpdateDCP} from 'core-logic/api/auth/useUpdateDCP';
import ModifierEmailModal from './ModifierEmailModal';

interface ModifierCompteData {
  prenom: string;
  nom: string;
  email: string;
}

const validation = Yup.object({
  prenom: Yup.string().required('Champ requis'),
  nom: Yup.string().required('Champ requis'),
  email: Yup.string()
    .email("Cette adresse email n'est pas valide")
    .required('Champ requis'),
});

export const MonCompte = ({user}: {user: UserData}) => {
  const {handleUpdateDCP} = useUpdateDCP(user.id);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  return (
    <div data-test="MonCompte">
      <h1 className="!mb-8 md:!mb-14">Mon compte</h1>
      <div
        data-test="modification-compte-formulaire"
        className="p-4 md:p-14 lg:px-24 bg-gray-100"
      >
        <p className="text-sm">Information requises</p>
        <Formik<ModifierCompteData>
          initialValues={{
            prenom: user.prenom!,
            nom: user.nom!,
            email: user.email!,
          }}
          validationSchema={validation}
          onSubmit={() => undefined}
        >
          {({values, isValid, handleBlur, resetForm}) => (
            <Form>
              <Field
                data-test="prenom"
                name="prenom"
                label="Prénom"
                component={FormInput}
                onBlur={(evt: FormikHandlers['handleBlur']) => {
                  handleBlur(evt);
                  isValid &&
                    user.prenom !== values.prenom &&
                    handleUpdateDCP({prenom: values.prenom});
                }}
              />
              <Field
                data-test="nom"
                name="nom"
                label="Nom"
                component={FormInput}
                onBlur={(evt: FormikHandlers['handleBlur']) => {
                  handleBlur(evt);
                  isValid &&
                    user.nom !== values.nom &&
                    handleUpdateDCP({nom: values.nom});
                }}
              />
              <Field
                data-test="email"
                name="email"
                label="Email"
                component={FormInput}
                onBlur={(evt: FormikHandlers['handleBlur']) => {
                  handleBlur(evt);
                  isValid &&
                    user.email !== values.email &&
                    setIsEmailModalOpen(true);
                }}
              />
              <ModifierEmailModal
                isOpen={isEmailModalOpen}
                setOpen={setIsEmailModalOpen}
                resetEmail={() =>
                  resetForm({values: {...values, email: user.email!}})
                }
                email={values.email}
              />
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

const MonCompteConnected = () => {
  const {user} = useAuth();

  return user && <MonCompte user={user} />;
};

export default MonCompteConnected;
