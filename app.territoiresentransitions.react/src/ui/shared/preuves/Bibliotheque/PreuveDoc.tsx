import {ChangeEvent, KeyboardEvent, MouseEvent} from 'react';
import classNames from 'classnames';
import {format} from 'date-fns';
import {fr} from 'date-fns/locale';
import {ButtonComment, ButtonEdit} from 'ui/shared/SmallIconButton';
import {formatFileSize, getExtension} from 'utils/file';
import {TPreuve, TEditHandlers} from './types';
import {openPreuve} from './openPreuve';
import {useEditPreuve} from './useEditPreuve';
import {useCurrentCollectivite} from 'core-logic/hooks/useCurrentCollectivite';
import {TEditState} from 'core-logic/hooks/useEditState';
import {ConfirmSupprPreuveBtn} from './ConfirmSupprPreuveBtn';

export type TPreuveDocProps = {
  classComment?: string;
  preuve: TPreuve;
  readonly?: boolean;
  handlers: TEditHandlers;
};

const PreuveDocConnected = (props: Omit<TPreuveDocProps, 'handlers'>) => {
  const handlers = useEditPreuve(props.preuve);
  const currentCollectivite = useCurrentCollectivite();
  return (
    <PreuveDoc
      {...props}
      readonly={
        !currentCollectivite || currentCollectivite.readonly || props.readonly
      }
      handlers={handlers}
    />
  );
};

export default PreuveDocConnected;

/**
 * Affiche un document (nom de fichier ou titre lien) et gère l'édition de
 * commentaire, la suppression et l'ouverture ou le téléchargement
 */
export const PreuveDoc = ({
  classComment,
  preuve,
  readonly,
  handlers,
}: TPreuveDocProps) => {
  const {commentaire, fichier, rapport} = preuve;
  const dateVisite = rapport?.date;

  const {remove, editComment, editFilename} = handlers;
  const isEditing = editComment.isEditing || editFilename.isEditing;

  return (
    <div data-test="item">
      <div className="flex justify-between group text-sm text-bf500 hover:bg-bf975 px-2 py-1 max-w-2xl mb-0 cursor-pointer">
        <PreuveTitle preuve={preuve} />
        {!readonly && !isEditing ? (
          <div className="invisible group-hover:visible">
            {fichier ? (
              <ButtonEdit
                title="Renommer"
                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  editFilename.enter();
                }}
              />
            ) : null}
            <ButtonComment
              title="Décrire"
              onClick={(e: MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                editComment.enter();
              }}
            />
            <ConfirmSupprPreuveBtn removePreuve={remove} />
          </div>
        ) : null}
      </div>
      {commentaire && !readonly && !isEditing ? (
        <p
          data-test="comment"
          className={`text-xs fr-text-mention--grey mb-0 ${classComment || ''}`}
          onClick={(e: MouseEvent<HTMLParagraphElement>) => {
            e.preventDefault();
            editComment.enter();
          }}
        >
          {commentaire}
        </p>
      ) : null}
      <TextInputWithEditState
        editState={editComment}
        placeholder="Écrire un commentaire..."
      />
      <TextInputWithEditState
        editState={editFilename}
        placeholder="Renommer le fichier..."
      />
      {dateVisite ? (
        <p className="text-xs grey625 mb-0">
          Visite effectuée le {formatDate(dateVisite)}
        </p>
      ) : null}
      {formatCreatedAt(preuve)}
    </div>
  );
};

// détermine le picto en fonction du type (fichier ou lien)
const preuvePicto = (preuve: TPreuve) => {
  const {fichier, lien} = preuve;
  if (fichier) {
    return 'fr-fi-file-line';
  }
  if (lien) {
    return 'fr-fi-links-fill';
  }
  return null;
};

// affiche le titre d'une preuve sous forme de lien
const PreuveTitle = ({preuve}: {preuve: TPreuve}) => {
  const picto = preuvePicto(preuve);

  // désactive un avertissement de lint à propos de l'attribut `href` non
  // valide, car si on met un <button> à la place comme c'est recommandé et même
  // avec le style `fr-link` les styles rendus ne sont pas bons (bouton arrondi
  // au survol et souligné absent)
  /* eslint-disable jsx-a11y/anchor-is-valid */
  return (
    <a
      data-test="name"
      href="#"
      className={classNames('fr-text--sm fr-mb-1v', picto, {
        'fr-link--icon-left': Boolean(picto),
      })}
      onClick={() => openPreuve(preuve)}
    >
      {formatTitle(preuve)}
    </a>
  );
};

// affiche un champ d'édition associé à un gestionnaire d'édition
const TextInputWithEditState = ({
  editState,
  placeholder,
}: {
  editState: TEditState;
  placeholder: string;
}) => {
  return editState.isEditing ? (
    <input
      autoFocus
      className="fr-input fr-my-2v"
      placeholder={placeholder}
      value={editState.value}
      onChange={(e: ChangeEvent<HTMLInputElement>) =>
        editState.setValue(e.target.value)
      }
      onBlur={editState.exit}
      onKeyUp={(e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          editState.exit();
        }
      }}
    />
  ) : null;
};

// formate le titre en fonction du type (fichier ou lien)
const formatTitle = (preuve: TPreuve) => {
  const {fichier, lien} = preuve;
  if (fichier) {
    const {filename, filesize} = fichier;
    return `${filename} (${getExtension(
      filename
    )?.toUpperCase()}, ${formatFileSize(filesize)})`;
  }
  if (lien) {
    const {titre} = lien;
    return titre;
  }
  return null;
};

// formate la date de création et le nom de l'utilisateur associé
const formatCreatedAt = (preuve: TPreuve) => {
  const {created_at, created_by_nom} = preuve;
  return created_at && created_by_nom
    ? formatDateAndAuthor(created_at, created_by_nom, false)
    : null;
};

const formatDateAndAuthor = (
  date: string,
  author: string,
  isModification: boolean
) => {
  const le = formatDate(date);
  const modif = isModification ? 'Modifié' : 'Ajouté';
  return (
    <span className="text-xs grey625">
      {modif} le {le} par {author}
    </span>
  );
};

const formatDate = (date: string) =>
  format(new Date(date), 'dd MMM yyyy', {locale: fr});
