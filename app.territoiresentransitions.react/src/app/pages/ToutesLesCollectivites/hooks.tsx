import {CollectiviteCarteRead} from 'generated/dataLayer/collectivite_carte_read';
import {RegionRead} from 'generated/dataLayer/region_read';
import {useHistory, useLocation} from 'react-router-dom';
import {useQuery as useQueryString} from 'core-logic/hooks/query';
import {useEffect, useState} from 'react';
import {useQuery, useQueryClient} from 'react-query';
import {fetchCollectiviteCards} from 'app/pages/ToutesLesCollectivites/queries';

const REGIONS_PARAM = 'r';

/**
 * Returns regions.
 *
 * todo use query.
 */
export const useRegions = (): RegionRead[] => {
  return [
    {
      code: '52',
      libelle: 'Pays de la Loire',
    },
    {
      code: '53',
      libelle: 'Bretagne',
    },
    {
      code: '75',
      libelle: 'Nouvelle-Aquitaine',
    },
    {
      code: '76',
      libelle: 'Occitanie',
    },
  ];
};

/**
 * Returns collectivités filtered.
 */
export const useFilteredCollectivites = (args: {
  regionCodes: string[];
}): {
  isLoading: boolean;
  collectivites: CollectiviteCarteRead[];
} => {
  const {data, isLoading} = useQuery(
    ['collectivite_card', ...args.regionCodes],
    () => fetchCollectiviteCards(args)
  );

  return {
    isLoading: isLoading,
    collectivites: data || [],
  };
};

/**
 * Renvoie la liste des codes régions sélectionnés et la méthode pour mettre
 * à jour cette liste.
 */
export const useRegionCodesFilter = (): {
  codes: string[];
  updateCodes: (newFilters: string[]) => void;
} => {
  const {filter, setFilter} = useUrlFilterParams(REGIONS_PARAM);
  const [codes, setCodes] = useState<string[]>([]);

  const updateCodes = (codes: string[]) => setFilter(codes.join(','));

  useEffect(() => {
    const codes = filter.split(',').filter(c => c.length > 0);
    setCodes(codes);
  }, [filter]);

  return {codes, updateCodes};
};

/**
 * Permet de d'utiliser un paramètre nommé `filterName` dans l'URL
 *
 * Renvoie la *valeur* du filtre (filter)
 * et la *fonction* pour mettre à jour cette valeur (setFilter).
 */
export const useUrlFilterParams = (
  filterName: string,
  initialFilter = ''
): {filter: string; setFilter: (newFilter: string) => void} => {
  const history = useHistory();
  const location = useLocation();

  const querystring = useQueryString();
  const filterValue = querystring.get(filterName) || initialFilter;

  // L'état interne mis à jour de l'extérieur via setFilter initialisé avec
  // le state de l'URL ou la valeur initiale.
  const [filter, setFilter] = useState(filterValue);

  useEffect(() => {
    // Évite de rafraichir le filtre si une autre partie de l'URL a changée.
    if (filter !== filterValue) {
      querystring.set(filterName, filter);
      // Met à jour l'URL avec React router.
      history.replace({...location, search: `?${querystring}`});
    }
  }, [filter]);

  return {filter, setFilter};
};
