import {useState} from 'react';
import Dialog from '@material-ui/core/Dialog';
import {
  ActionContexteExpandPanel,
  ActionExemplesExpandPanel,
  ActionPerimetreEvaluationExpandPanel,
  ActionReductionPotentielExpandPanel,
  ActionRessourcesExpandPanel,
} from 'ui/shared/actions/ActionExpandPanels';
import {ActionDefinitionSummary} from 'core-logic/api/endpoints/ActionDefinitionSummaryReadEndpoint';

const ContexteExemplesAndRessourcesDialogContent = ({
  action,
}: {
  action: ActionDefinitionSummary;
}) => (
  <div className="p-7 flex flex-col">
    <h4 className="pb-4"> {action.nom} </h4>

    {action.have_contexte && <ActionContexteExpandPanel action={action} />}
    {action.have_exemples && <ActionExemplesExpandPanel action={action} />}
    {action.have_ressources && <ActionRessourcesExpandPanel action={action} />}
    {action.have_reduction_potentiel && (
      <ActionReductionPotentielExpandPanel action={action} />
    )}
    {action.have_perimetre_evaluation && (
      <ActionPerimetreEvaluationExpandPanel action={action} />
    )}
  </div>
);

export const DescriptionContextAndRessourcesDialogButton = ({
  action,
}: {
  action: ActionDefinitionSummary;
}) => {
  const [opened, setOpened] = useState(false);

  return (
    <div>
      <button
        className="fr-btn fr-btn--secondary fr-btn--sm fr-fi-information-fill fr-btn--icon-left"
        onClick={() => setOpened(true)}
      >
        Contexte, exemples et ressources
      </button>
      <Dialog
        open={opened}
        onClose={() => setOpened(false)}
        maxWidth="md"
        fullWidth={true}
      >
        <ContexteExemplesAndRessourcesDialogContent action={action} />
      </Dialog>
    </div>
  );
};
