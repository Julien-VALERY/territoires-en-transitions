import { CollectiviteNavigation, Navigation } from 'app/Navigation';
import { RejoindreCetteCollectiviteDialog } from 'app/pages/MesCollectivites/RejoindreCetteCollectiviteDialog';
import { CollectiviteRedirector } from 'app/Redirector';
import ademeLogoImage from 'app/static/img/ademe.jpg';
import { TAuthContext } from 'core-logic/api/auth/AuthProvider';
import { getReferentContacts } from 'core-logic/api/procedures/collectiviteProcedures';
import {
  CurrentCollectivite
} from 'core-logic/hooks/useCurrentCollectivite';
import {
  authBloc,
  AuthBloc,
  currentCollectiviteBloc,
  CurrentCollectiviteBloc
} from 'core-logic/observables';
import { OwnedCollectiviteRead } from 'generated/dataLayer';
import { observer } from 'mobx-react-lite';
import LogoRepubliqueFrancaise from 'ui/logo/LogoRepubliqueFrancaise';
import { makeCollectiviteNavItems } from './makeCollectiviteNavItems';

export const Header = ({
  auth,
  currentCollectivite,
  ownedCollectivites,
}: {
  auth: TAuthContext;
  currentCollectivite: CurrentCollectivite | null;
  ownedCollectivites: OwnedCollectiviteRead[] | null;
}) => {
  const collectiviteNav = currentCollectivite
    ? makeCollectiviteNavItems(currentCollectivite)
    : null;

const HeaderObserver = observer(
  ({
    authBloc,
    currentCollectiviteBloc,
  }: {
    authBloc: AuthBloc;
    currentCollectiviteBloc: CurrentCollectiviteBloc;
  }) => (
    <>
      <CollectiviteRedirector />
      <header role="banner" className="header fr-header ">
        <div className="fr-header__body">
          <div className="fr-container">
            <div className="fr-header__body-row header__row">
              <div className="fr-header__brand fr-enlarge-link hidden md:block">
                <div className="fr-header__brand-top">
                  <div className="fr-header__logo">
                    <LogoRepubliqueFrancaise />
                  </div>
                </div>
                <div className="fr-header__ademe">
                  <img
                    src={ademeLogoImage}
                    alt="logo ADEME"
                    loading="lazy"
                    className="h-20"
                  />
                </div>
                <div className="fr-header__service">
                  <a href="/" title="Accueil">
                    <p className="fr-header__service-title">
                      Territoires en Transitions
                    </p>
                  </a>
                </div>
              </div>
              <Navigation />
            </div>
          </div>
        </div>
        <CollectiviteHeader bloc={currentCollectiviteBloc} />
      </header>
      <CollectiviteReadOnlyBanner bloc={currentCollectiviteBloc} />
    </>
  )
);

const CollectiviteReadOnlyBanner = observer(
  ({bloc}: {bloc: CurrentCollectiviteBloc}) => {
    if (bloc.readonly)
      return (
        <div className="flex justify-center items-center bg-yellow-400 py-4 bg-opacity-70">
          <div className="text-sm mr-4">Lecture seule</div>
          <RejoindreCetteCollectiviteDialog
            getReferentContacts={getReferentContacts}
            collectivite={bloc.currentCollectivite!}
          />
        </div>
      );
    return null;
  }
);

const CollectiviteHeader = observer(
  ({bloc}: {bloc: CurrentCollectiviteBloc}) => {
    return (
      <>
        <div className="fr-container">
          {bloc.currentCollectivite !== null && (
            <div>
              <div className="flex flex-row justify-between">
                <CollectiviteNavigation />
                <div className="flex items-center font-bold">
                  {bloc.currentCollectivite.nom}
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }
);

const Header = () => (
  <HeaderObserver
    currentCollectiviteBloc={currentCollectiviteBloc}
    authBloc={authBloc}
  />
);

export default Header;
