import classNames from 'classnames';
import {makeCollectiviteTableauBordUrl} from 'app/paths';
import {Link} from 'react-router-dom';
import {BadgeNiveauAcces} from './BadgeNiveauAcces';
import {HeaderPropsWithModalState} from './types';

const ID = 'SelectCollectivite';

/**
 * Affiche le sélecteur de collectivité
 */
export const SelectCollectivite = (props: HeaderPropsWithModalState) => {
  const {
    currentCollectivite,
    ownedCollectivites,
    openedId,
    setOpenedId,
    setModalOpened,
  } = props;
  if (!currentCollectivite || !ownedCollectivites) {
    return null;
  }

  const opened = openedId === ID; // vérifie si le menu est ouvert

  // liste des collectivités à afficher
  const listCollectivites = ownedCollectivites?.filter(
    ({nom}) => nom !== currentCollectivite.nom
  );

  return (
    <ul className="fr-nav__list" data-test={ID}>
      <li className="fr-nav__item !relative">
        <button
          className="fr-nav__btn min-w-[15rem]"
          aria-controls={ID}
          aria-expanded={opened}
          onClick={() => setOpenedId(opened ? null : ID)}
        >
          <b className="mr-auto pointer-events-none">
            {currentCollectivite.nom}
          </b>
          <BadgeNiveauAcces
            acces={currentCollectivite.niveau_acces}
            isAuditeur={currentCollectivite.est_auditeur}
            className="ml-4"
          />
        </button>
        <div
          className={classNames('fr-menu right-0', {
            'fr-collapse': !opened,
          })}
          id={ID}
        >
          <ul
            className="fr-menu__list"
            onClickCapture={() => setOpenedId(null)}
          >
            {listCollectivites.map(
              ({collectivite_id, nom, niveau_acces, est_auditeur}) => (
                <li className="fr-nav__item" key={collectivite_id}>
                  <Link
                    to={makeCollectiviteTableauBordUrl({
                      collectiviteId: collectivite_id!,
                    })}
                    target="_self"
                    className="fr-nav__link"
                    aria-controls="modal-header__menu"
                    onClick={() => setModalOpened(false)}
                  >
                    {nom}
                    <BadgeNiveauAcces
                      acces={niveau_acces}
                      isAuditeur={est_auditeur || false}
                      className="float-right"
                    />
                  </Link>
                </li>
              )
            )}
          </ul>
        </div>
      </li>
    </ul>
  );
};
