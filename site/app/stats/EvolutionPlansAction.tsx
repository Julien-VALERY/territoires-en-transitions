import React from 'react';
import {ChartHead, ChartTitle} from './headings';
import EvolutionFiches, {useEvolutionFiches} from './EvolutionFiches';

type EvolutionPlansActionProps = {
  region?: string;
  department?: string;
};

export function EvolutionPlansAction({
  region = '',
  department = '',
}: EvolutionPlansActionProps) {
  const {data: collectivites} = useEvolutionFiches(
    'stats_locales_evolution_collectivite_avec_minimum_fiches',
    region,
    department
  );
  const {data: fiches} = useEvolutionFiches(
    'stats_locales_evolution_nombre_fiches',
    region,
    department
  );

  return (
    <>
      {collectivites && fiches && (
        <ChartHead>
          <>
            Évolution de l&apos;utilisation des plans d&apos;action
            <br />
            {collectivites.last} collectivité
            {collectivites.last !== 1 && 's'}
            {collectivites.last === 1 ? ' a ' : ' ont '}
            créé des plans d’actions et {fiches.last} fiche
            {fiches.last !== 1 && 's'} actions
            {fiches.last === 1 ? ' a été créée' : ' ont été créées'}
          </>
        </ChartHead>
      )}
      <div className="fr-grid-row fr-grid-row--center fr-grid-row--gutters">
        {collectivites && (
          <div className="fr-col-xs-12 fr-col-sm-12 fr-col-md-6 fr-col-lg-6 fr-ratio-16x9">
            <ChartTitle>Nombre de collectivités avec 5+ fiches</ChartTitle>
            <EvolutionFiches
              vue="stats_locales_evolution_collectivite_avec_minimum_fiches"
              region={region}
              department={department}
            />
          </div>
        )}
        {fiches && (
          <div className="fr-col-xs-12 fr-col-sm-12 fr-col-md-6 fr-col-lg-6 fr-ratio-16x9">
            <ChartTitle>Nombre de fiches action créées</ChartTitle>
            <EvolutionFiches
              vue="stats_locales_evolution_nombre_fiches"
              region={region}
              department={department}
            />
          </div>
        )}
      </div>
    </>
  );
}
