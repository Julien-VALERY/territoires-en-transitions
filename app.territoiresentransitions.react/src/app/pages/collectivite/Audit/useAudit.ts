import {useQuery} from 'react-query';
import {supabaseClient} from 'core-logic/api/supabase';
import {useCollectiviteId, useReferentielId} from 'core-logic/hooks/params';
import {TAudit} from './types';
import {Referentiel} from 'types/litterals';
import {useAuth} from 'core-logic/api/auth/AuthProvider';
import {useCollectiviteMembres} from '../Users/useCollectiviteMembres';
import {Membre} from '../Users/types';

// charge les données
export const fetch = async (
  collectivite_id: number,
  referentiel: Referentiel
) => {
  // lit le statut de l'audit en cours (s'il existe)
  const {data, error} = await supabaseClient
    .from('audit')
    .select(
      'id,collectivite_id,referentiel,demande_id,date_debut,date_fin,auditeurs:audit_auditeur (id:auditeur)'
    )
    .match({collectivite_id, referentiel})
    .limit(1);

  if (error || !data?.length) {
    return null;
  }

  return data[0] as TAudit;
};

/**
 * Statut d'audit du référentiel et de la collectivité courante.
 */
export const useAudit = () => {
  const collectivite_id = useCollectiviteId();
  const referentiel = useReferentielId() as Referentiel;
  return useQuery(['audit', collectivite_id, referentiel], () =>
    collectivite_id && referentiel ? fetch(collectivite_id, referentiel) : null
  );
};

/** Indique si l'utilisateur courant est l'auditeur pour la
 * collectivité et le référentiel courant */
export const useIsAuditeur = () => {
  const {user} = useAuth();
  const {data: audit} = useAudit();
  if (!audit || !user || !audit.auditeurs?.length) {
    return false;
  }
  return audit.auditeurs.findIndex(({id}) => id === user.id) !== -1;
};

/** Liste des auditeurs */
export const useAuditeurs = () => {
  const {data: audit, isLoading: isLoadingAudit} = useAudit();
  const {membres, isLoading: isLoadingMembres} = useCollectiviteMembres();
  const isLoading = isLoadingAudit || isLoadingMembres;

  if (isLoading || !audit || !audit.auditeurs?.length) {
    return {isLoading};
  }

  const data = audit.auditeurs
    .map(({id}) => membres.find(m => m.user_id === id))
    .filter(m => !!m) as Membre[];
  return {
    isLoading: false,
    data,
  };
};
