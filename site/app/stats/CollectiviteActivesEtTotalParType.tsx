'use client';

import useSWR from 'swr';
import { ResponsiveWaffle } from '@nivo/waffle';
import { supabase } from '../initSupabase';
import { bottomLegend, getLegendData, theme } from './shared';

function useCollectiviteActivesEtTotalParType() {
  return useSWR('stats_collectivite_actives_et_total_par_type', async () => {
    const { data, error } = await supabase
      .from('stats_collectivite_actives_et_total_par_type')
      .select();
    if (error) {
      throw new Error(error.message);
    }
    if (!data) {
      return null;
    }
    const epcis = data.filter((d) => d.type_collectivite === 'EPCI')[0];

    return {
      categories: [
        {
          id: epcis.type_collectivite + '_activees',
          label: epcis.type_collectivite + ' activés',
          value: epcis.actives,
        },
        {
          id: epcis.type_collectivite + '_restantes',
          label: epcis.type_collectivite + ' inactifs',
          value: (epcis.total || 0) - (epcis.actives || 0),
        },
      ],
      total: epcis.total,
    };
  });
}

export default function CollectiviteActivesEtTotalParType() {
  const { data } = useCollectiviteActivesEtTotalParType();

  if (!data) {
    return null;
  }

  const { categories } = data;
  const legendData = getLegendData(categories);
  console.log(legendData);

  return (
    <div style={{ height: 400 }}>
      <ResponsiveWaffle
        colors={['#21AB8E', '#FF732C']}
        theme={theme}
        data={data.categories}
        total={data.total || 0}
        rows={10}
        columns={10}
        margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
        animate={false}
        legends={[{ ...bottomLegend, translateY: 5 }]}
      />
    </div>
  );
}
