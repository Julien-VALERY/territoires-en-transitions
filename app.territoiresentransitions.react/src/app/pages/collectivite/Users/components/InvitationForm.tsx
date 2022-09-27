import {useMemo, useRef, useState} from 'react';
import {
  Field,
  FieldAttributes,
  FieldInputProps,
  Form,
  Formik,
  FormikProps,
} from 'formik';
import * as Yup from 'yup';
import classNames from 'classnames';
import {UserData} from 'core-logic/api/auth/AuthProvider';
import {CurrentCollectivite} from 'core-logic/hooks/useCurrentCollectivite';
import InvitationMessage from 'app/pages/collectivite/Users/components/InvitationMessage';
import {NiveauAcces} from 'generated/dataLayer';
import {
  AddUserToCollectiviteRequest,
  AddUserToCollectiviteResponse,
} from 'app/pages/collectivite/Users/useAddUserToCollectivite';
import FormInput from 'ui/shared/form/FormInput';

type AccesOption = {
  value: NiveauAcces;
  label: string;
};

type FormProps = {email: string; acces: '' | NiveauAcces};

type InvitationFormProps = {
  currentUser: UserData;
  currentCollectivite: CurrentCollectivite;
  addUser: (request: AddUserToCollectiviteRequest) => void;
  addUserResponse: AddUserToCollectiviteResponse | null;
  resetAddUser: () => void;
};

const InvitationForm = ({
  currentUser,
  currentCollectivite,
  addUser,
  addUserResponse,
  resetAddUser,
}: InvitationFormProps) => {
  const validationInvitation = Yup.object({
    email: Yup.string()
      .email('Format attendu : nom@domaine.fr')
      .required('Ce champ est obligatoire'),
    acces: Yup.string().required('Ce champ est obligatoire'),
  });

  const accesOptions: AccesOption[] = useMemo(() => {
    const adminOption: AccesOption = {value: 'admin', label: 'Admin'};
    const editionOptions: AccesOption[] = [
      {
        value: 'edition',
        label: 'Édition',
      },
      {
        value: 'lecture',
        label: 'Lecture',
      },
    ];
    if (currentCollectivite.niveau_acces === 'admin') {
      return [adminOption, ...editionOptions];
    } else {
      return editionOptions;
    }
  }, [currentCollectivite]);

  const formRef = useRef<FormikProps<FormProps>>(null);

  const [formIsFilling, setFormIsFilling] = useState(true);
  const [accesInvitationForm, setAccesInvitationForm] = useState<
    NiveauAcces | undefined
  >(undefined);

  const handleClearForm = () => {
    setFormIsFilling(true);
    resetAddUser();
    if (formRef.current) {
      formRef.current.handleReset();
    }
  };

  const onSubmitInvitation = (values: FormProps) => {
    if (values.acces) {
      const req: AddUserToCollectiviteRequest = {
        collectiviteId: currentCollectivite.collectivite_id,
        email: values.email,
        niveauAcces: values.acces,
      };
      addUser(req);
      setFormIsFilling(false);
      setAccesInvitationForm(values.acces);
    }
  };

  return (
    <div data-test="invitation-form" className="max-w-4xl">
      <Formik
        innerRef={formRef}
        initialValues={{email: '', acces: ''}}
        validationSchema={validationInvitation}
        onSubmit={onSubmitInvitation}
      >
        <Form
          className="md:flex gap-6"
          onChange={() => {
            setFormIsFilling(true);
            resetAddUser();
          }}
        >
          <Field
            type="text"
            name="email"
            label="Adresse email de la personne à inviter"
            component={FormInput}
          />
          <SelectField
            name="acces"
            label="Niveau d’accès pour cette collectivité"
            options={accesOptions}
          />
          <button
            type="submit"
            className="fr-btn md:mt-7 md:mb-auto"
            disabled={!formIsFilling}
          >
            Ajouter
          </button>
        </Form>
      </Formik>
      {!formIsFilling && accesInvitationForm && (
        <AddUserResponse
          addUserResponse={addUserResponse}
          currentCollectivite={currentCollectivite}
          currentUser={currentUser}
          handleClearForm={handleClearForm}
          acces={accesInvitationForm}
        />
      )}
    </div>
  );
};

const AddUserResponse = ({
  addUserResponse,
  currentCollectivite,
  currentUser,
  handleClearForm,
  acces,
}: {
  addUserResponse: AddUserToCollectiviteResponse | null;
  currentCollectivite: CurrentCollectivite;
  currentUser: UserData;
  handleClearForm: () => void;
  acces: NiveauAcces;
}) => {
  if (addUserResponse?.invitationUrl) {
    return (
      <InvitationMessage
        currentCollectivite={currentCollectivite}
        currentUser={currentUser}
        acces={acces}
        invitationUrl={addUserResponse.invitationUrl}
      />
    );
  } else if (addUserResponse?.added) {
    setTimeout(() => {
      handleClearForm();
    }, 5000);
    return (
      <div className="fr-alert fr-alert--success">
        Nouveau membre ajouté avec succès à la collectivité !
      </div>
    );
  } else if (addUserResponse?.error) {
    setTimeout(() => {
      handleClearForm();
    }, 5000);
    return (
      <div className="fr-alert fr-alert--info">{addUserResponse?.error}</div>
    );
  }
  return null;
};

export default InvitationForm;

type SelectFieldProps = FieldAttributes<{
  label: string;
  options: AccesOption[];
}>;

const SelectField = (props: SelectFieldProps) => (
  <Field {...props}>
    {({
      field,
      form,
    }: {
      field: FieldInputProps<string>;
      form: FormikProps<FormProps>;
    }) => {
      const errorMessage = (form.errors as Record<string, string | undefined>)[
        field.name
      ];
      const isTouched = (form.touched as Record<string, boolean | undefined>)[
        field.name
      ];
      const isError = errorMessage && isTouched;

      return (
        <div
          className={classNames('fr-select-group md:grow', {
            'fr-select-group--error': isError,
          })}
        >
          <label className="fr-label" htmlFor={props.label}>
            {props.label}
          </label>
          <select
            className={classNames('fr-select', {
              'fr-select--error': isError,
            })}
            id={props.label}
            {...field}
          >
            <option value="" disabled hidden>
              Sélectionnez une option
            </option>
            {props.options.map((option: AccesOption) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {isError && <p className="fr-error-text">{errorMessage}</p>}
        </div>
      );
    }}
  </Field>
);
