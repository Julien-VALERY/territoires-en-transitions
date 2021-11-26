import {useEffect, useState} from 'react';
import {currentUtilisateurDroits} from 'core-logic/api/authentication';
import {EpciStorable} from 'storables/EpciStorable';
import {useAllStorables} from 'core-logic/hooks/storables';
import {epciStore} from 'core-logic/api/hybridStores';
import {useDroits} from 'core-logic/hooks/authentication';
import {EpciRead} from 'generated/dataLayer/epci_read';
import {epciReadEndpoint} from 'core-logic/api/endpoints/EpciReadEndpoint';

/**
 * Returns the list of epcis owned by the current user.
 */
export const currentUserEpcis = (): EpciStorable[] => {
  // const all = allSortedEpcis();
  // const results = await epciReadEndpoint.getBy({});
  const [allEpcis, setAllEpcis] = useState<EpciRead[]>([]);
  useEffect(() => {
    epciReadEndpoint.getBy({}).then(allEpcis => setAllEpcis(allEpcis));
  }, []);

  const droits = useDroits();
  // const [epcis, setEpcis] = useState<EpciStorable[]>([]);

  // useEffect(() => {
  // currentUtilisateurDroits().then(droits => {
  // if (droits) {
  // const writable = [];
  // for (const droit of droits) {
  //   if (droit.ecriture) {
  //     for (const epci of allEpcis) {
  //       if (epci.id === droit.epci_id) {
  //         writable.push(epci);
  //         break;
  //       }
  //     }
  //   }
  // }
  // if (!writable.every(s => epcis.includes(s))) setEpcis(writable);
  // }
  // });
  // }, [epcis, allEpcis, droits]);

  return []; //epcis.sort((a, b) => a.nom.localeCompare(b.nom));
};

/**
 * Returns all the stored Epcis sorted alphabetically.
 */
export const allSortedEpcis = (): EpciStorable[] => {
  const allEpcis = useAllStorables<EpciStorable>(epciStore);
  allEpcis.sort((a, b) => a.nom.localeCompare(b.nom));
  return allEpcis;
};
