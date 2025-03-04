'use client';

import useSWR from 'swr';
import {ResponsiveLine} from '@nivo/line';
import {supabase} from '../initSupabase';
import {
  axisBottomAsDate,
  axisLeftMiddleLabel,
  colors,
  formatInteger,
  fromMonth,
  theme,
} from './shared';
import {ChartTitle} from './headings';
import {addLocalFilters} from './utils';

function useValeursIndicateursPersoRenseignees(
  codeRegion: string,
  codeDepartement: string
) {
  return useSWR(
    `stats_locales_evolution_resultat_indicateur_personnalise-${codeRegion}-${codeDepartement}`,
    async () => {
      let select = supabase
        .from('stats_locales_evolution_resultat_indicateur_personnalise')
        .select()
        .gte('mois', fromMonth);

      select = addLocalFilters(select, codeDepartement, codeRegion);

      const {data, error} = await select;

      if (error) {
        throw new Error(
          'stats_locales_evolution_resultat_indicateur_personnalise'
        );
      }
      if (!data || !data.length) {
        return null;
      }
      return [
        {
          id: 'Valeurs renseignées',
          data: data.map(d => ({x: d.mois, y: d.indicateurs})),
          last: data[data.length - 1].indicateurs,
        },
      ];
    }
  );
}

type ValeursIndicateursPersoRenseigneesProps = {
  region?: string;
  department?: string;
};

export default function ValeursIndicateursPersoRenseignees({
  region = '',
  department = '',
}: ValeursIndicateursPersoRenseigneesProps) {
  const {data} = useValeursIndicateursPersoRenseignees(region, department);

  if (!data) return null;

  return (
    <>
      <ChartTitle>
        <b>{formatInteger(data[0].last)}</b> indicateurs personnalisés
        renseignés
      </ChartTitle>
      <div style={{height: '400px'}}>
        <ResponsiveLine
          colors={colors}
          theme={theme}
          data={data}
          // les marges servent aux légendes
          margin={{top: 5, right: 5, bottom: 85, left: 55}}
          xScale={{type: 'point'}}
          yScale={{
            type: 'linear',
            min: 'auto',
            max: 'auto',
            stacked: false,
          }}
          // on interpole la ligne de façon bien passer sur les points
          curve="monotoneX"
          lineWidth={4}
          pointSize={4}
          yFormat={formatInteger}
          axisBottom={axisBottomAsDate}
          axisLeft={{
            ...axisLeftMiddleLabel(
              'Valeurs d’indicateurs personnalisés renseignées'
            ),
            legendOffset: -50,
          }}
          pointBorderWidth={4}
          pointBorderColor={{from: 'serieColor'}}
          pointLabelYOffset={-12}
          enableSlices="x"
          animate={false}
        />
      </div>
    </>
  );
}
