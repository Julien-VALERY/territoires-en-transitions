import {Link, useHistory} from 'react-router-dom';
import {DescriptionContextAndRessourcesDialogButton} from './_DescriptionContextAndRessourcesDialogButton';
import {IndicateurReferentielCard} from 'app/pages/collectivite/Indicateurs/IndicateurReferentielCard';
import {IndicateurDefinitionRead} from 'generated/dataLayer/indicateur_definition_read';
import {indicateurActionReadEndpoint} from 'core-logic/api/endpoints/IndicateurActionReadEndpoint';
import {useEffect, useState} from 'react';
import {useAllIndicateurDefinitions} from 'core-logic/hooks/indicateur_definition';
import {addTargetToContentAnchors} from 'utils/content';
import Tabs from 'ui/shared/Tabs';
import {Tab} from '@dataesr/react-dsfr';
import {ActionReferentielDisplayTitle} from 'ui/referentiels/ActionReferentielDisplayTitle';
import {Spacer} from 'ui/shared/Spacer';
import {ActionCommentaire} from 'ui/shared/actions/ActionCommentaire';
import ActionProgressBar from 'ui/referentiels/ActionProgressBar';
import {ActionReferentielAvancementRecursiveCard} from 'ui/referentiels/ActionReferentielAvancementRecursiveCard';
import {Switch} from '@material-ui/core';
import {useActionSummaryChildren} from 'core-logic/hooks/referentiel';
import {ActionDefinitionSummary} from 'core-logic/api/endpoints/ActionDefinitionSummaryReadEndpoint';
import {OrientationQuickNav} from 'app/pages/collectivite/Referentiels/QuickNav';
import {PersoPotentiel} from '../PersoPotentielModal/PersoPotentiel';
import {useActionScore} from 'core-logic/hooks/scoreHooks';
import {
  ActionVueParamOption,
  makeCollectiviteActionUrl,
  ReferentielParamOption,
} from 'app/paths';
import {
  useActionVue,
  useCollectiviteId,
  useReferentielId,
} from 'core-logic/hooks/params';
import HistoriqueListe from 'app/pages/collectivite/Historique/HistoriqueListe';
import ScrollTopButton from 'ui/shared/ScrollTopButton';
import ActionNav from './ActionNav';
import ActionPreuvePanel from 'ui/shared/actions/ActionPreuvePanel/ActionPreuvePanel';
import {DownloadDocs} from './DownloadDocs';
import DOMPurify from 'dompurify';

const useActionLinkedIndicateurDefinitions = (actionId: string) => {
  const [linkedIndicateurDefinitions, setLinkedIndicateurDefinitions] =
    useState<IndicateurDefinitionRead[]>([]);

  const allIndicateurDefinitions = useAllIndicateurDefinitions();

  useEffect(() => {
    indicateurActionReadEndpoint.getBy({}).then(allIndicateurActions => {
      const linkedIndicateurDefinitions = allIndicateurActions
        .filter(indicateurAction => indicateurAction.action_id === actionId)
        .map(linkedIndicateurAction =>
          allIndicateurDefinitions.find(
            indicateurDefinition =>
              indicateurDefinition.id === linkedIndicateurAction.indicateur_id
          )
        );

      setLinkedIndicateurDefinitions(
        linkedIndicateurDefinitions.filter(
          definition => !!definition
        ) as IndicateurDefinitionRead[]
      );
    });
  }, [allIndicateurDefinitions]);
  return linkedIndicateurDefinitions;
};

// index des onglets de la page Action
const TABS_INDEX: Record<ActionVueParamOption, number> = {
  suivi: 0,
  preuves: 1,
  indicateurs: 2,
  historique: 3,
};

const useIsFullyRenseigne = (action: ActionDefinitionSummary): boolean => {
  const actionScore = useActionScore(action.id);
  return (
    !!actionScore &&
    (actionScore.completed_taches_count === actionScore.total_taches_count ||
      actionScore.desactive)
  );
};

const Action = ({action}: {action: ActionDefinitionSummary}) => {
  const [showOnlyActionWithData, setShowOnlyActionWithData] = useState(false);
  const children = useActionSummaryChildren(action);
  const actionVue = useActionVue();
  const history = useHistory();
  const collectiviteId = useCollectiviteId();
  const referentielId = useReferentielId() as ReferentielParamOption;

  const actionLinkedIndicateurDefinitions =
    useActionLinkedIndicateurDefinitions(action?.id);

  if (!action) {
    return <Link to="./referentiels" />;
  }

  const activeTab = actionVue ? TABS_INDEX[actionVue] : TABS_INDEX['suivi'];

  // synchronise l'url lors du passage d'un onglet à l'autre
  const handleChange = (activeTab: number) => {
    // recherche le nom de la vue correspondant à l'onglet courant
    const view = Object.entries(TABS_INDEX).find(
      ([, index]) => index === activeTab
    );
    const name = view?.[0] as ActionVueParamOption;

    // met à jour l'url
    if (collectiviteId && name && name !== actionVue) {
      history.replace(
        makeCollectiviteActionUrl({
          collectiviteId,
          referentielId,
          actionVue: name,
          actionId: action.id,
        })
      );
    }
  };

  if (!action || !collectiviteId) {
    return <Link to="./referentiels" />;
  }

  return (
    <div className="fr-container" data-test={`Action-${action.identifiant}`}>
      <div className="mt-8 mb-4">
        <OrientationQuickNav action={action} />
      </div>
      <div className="sticky top-0 z-40 flex flex-row justify-between bg-white pr-8 py-4">
        <div className="flex flex-col w-4/5">
          <ActionReferentielDisplayTitle action={action} />
        </div>
        <div className="w-1/6">
          <ActionProgressBar actionId={action.id} />
        </div>
      </div>
      <div className="mb-16">
        <div className="flex flex-col w-4/5">
          {action.have_questions && (
            <>
              <PersoPotentiel actionDef={action} />
              <Spacer size={2} />
            </>
          )}
          <div
            className="htmlContent"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                addTargetToContentAnchors(action.description ?? '')
              ),
            }}
          />
          <DescriptionContextAndRessourcesDialogButton action={action} />
          <Spacer size={1} />
          <ActionCommentaire action={action} />
        </div>
      </div>

      <Tabs activeTab={activeTab} onChange={handleChange}>
        <Tab label="Suivi de l'action">
          <section>
            <div className="flex items-center fr-text--sm fr-m-0">
              Afficher uniquement les actions non-renseignées
              <Switch
                color="primary"
                checked={showOnlyActionWithData}
                inputProps={{'aria-label': 'controlled'}}
                onChange={() => {
                  setShowOnlyActionWithData(!showOnlyActionWithData);
                }}
              />
            </div>
            {children.map(action => (
              <ActionAvancement
                action={action}
                key={action.id}
                showOnlyActionWithData={showOnlyActionWithData}
              />
            ))}
          </section>
        </Tab>
        <Tab label="Preuves">
          <section>
            <ActionPreuvePanel withSubActions showWarning action={action} />
            <DownloadDocs action={action} />
          </section>
        </Tab>
        <Tab label="Indicateurs">
          <section>
            {actionLinkedIndicateurDefinitions.length === 0 && (
              <p>Cette action ne comporte pas d'indicateur</p>
            )}

            {actionLinkedIndicateurDefinitions.map(definition => (
              <IndicateurReferentielCard
                key={definition.id}
                definition={definition}
              />
            ))}
          </section>
        </Tab>
        <Tab label="Historique">
          <HistoriqueListe actionId={action.id} />
        </Tab>
      </Tabs>
      <ActionNav actionId={action.id} />
      <div className="mt-8">
        <ScrollTopButton />
      </div>
    </div>
  );
};

export default Action;

const ActionAvancement = ({
  action,
  showOnlyActionWithData,
}: {
  action: ActionDefinitionSummary;
  showOnlyActionWithData: boolean;
}) => {
  const isFullyRenseigne = useIsFullyRenseigne(action);

  if (showOnlyActionWithData && isFullyRenseigne) {
    return null;
  }

  return (
    <ActionReferentielAvancementRecursiveCard
      action={action}
      displayAddFicheActionButton={true}
      displayProgressStat={true}
    />
  );
};
