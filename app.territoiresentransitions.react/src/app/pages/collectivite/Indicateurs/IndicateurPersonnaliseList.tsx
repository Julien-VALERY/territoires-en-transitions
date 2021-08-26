import React, {useEffect} from 'react';
import {IndicateurPersonnaliseStorable} from 'storables/IndicateurPersonnaliseStorable';
import {commands} from 'core-logic/commands';
import {IndicateurPersonnaliseCard} from 'app/pages/collectivite/Indicateurs/IndicateurPersonnaliseCard';
import {v4 as uuid} from 'uuid';

import {IndicateurPersonnaliseInterface} from 'generated/models/indicateur_personnalise';
import {useAllStorables, useEpciId, useStorable} from 'core-logic/hooks';
import {IndicateurPersonnaliseForm} from 'app/pages/collectivite/Indicateurs/IndicateurPersonnaliseForm';
import {indicateurPersonnaliseStore} from 'core-logic/api/hybridStores';

function IndicateurPersonnaliseCreator(props: {onClose: () => void}) {
  const epciId = useEpciId();
  const freshData = (): IndicateurPersonnaliseInterface => {
    return {
      epci_id: epciId!,
      uid: uuid(),
      custom_id: '',
      nom: '',
      description: '',
      unite: '',
      meta: {
        commentaire: '',
      },
    };
  };
  const [data, setData] = React.useState<IndicateurPersonnaliseInterface>(
    freshData()
  );

  const onSave = (indicateur: IndicateurPersonnaliseInterface) => {
    indicateurPersonnaliseStore.store(
      new IndicateurPersonnaliseStorable(indicateur)
    );
    setData(freshData());
    props.onClose();
  };

  return <IndicateurPersonnaliseForm indicateur={data} onSave={onSave} />;
}

export const IndicateurPersonnaliseList = () => {
  const [creating, setCreating] = React.useState<boolean>(false);
  const indicateurs = useAllStorables<IndicateurPersonnaliseStorable>(
    indicateurPersonnaliseStore
  );
  indicateurs.sort((a, b) => a.nom.localeCompare(b.nom));

  return (
    <div className="app mx-5 mt-5">
      <div className="flex flex-row justify-between">
        <h2 className="fr-h2">Mes indicateurs</h2>

        {!creating && (
          <div>
            <button className="fr-btn " onClick={() => setCreating(true)}>
              Ajouter un indicateur
            </button>
          </div>
        )}
      </div>
      {creating && (
        <div className="w-2/3 mb-5 border-bf500 border-l-4 pl-4">
          <div className="flex flex-row justify-between">
            <h3 className="fr-h3">Nouvel indicateur</h3>
            <button
              className="fr-btn fr-btn--secondary"
              onClick={() => setCreating(false)}
            >
              x
            </button>
          </div>
          <IndicateurPersonnaliseCreator onClose={() => setCreating(false)} />
        </div>
      )}
      <section className=" flex flex-col">
        {indicateurs.map(indicateur => (
          <IndicateurPersonnaliseCard
            indicateur={indicateur}
            key={indicateur.id}
          />
        ))}
      </section>
    </div>
  );
};
