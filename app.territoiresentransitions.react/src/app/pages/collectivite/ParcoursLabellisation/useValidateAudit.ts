import {useMutation, useQueryClient} from 'react-query';
import {supabaseClient} from 'core-logic/api/supabase';
import {Database} from 'types/database.types';

export type TValidateAudit = ReturnType<typeof useValidateAudit>['mutate'];

/** Valider un audit */
export const useValidateAudit = () => {
  const queryClient = useQueryClient();

  return useMutation(validateAudit, {
    mutationKey: 'validateAudit',
    onSuccess: (data, variables) => {
      const {collectivite_id, referentiel} = variables;
      queryClient.invalidateQueries(['audit', collectivite_id, referentiel]);
    },
  });
};

const validateAudit = async (
  audit: Database['public']['Tables']['audit']['Row']
) => supabaseClient.from('audit').update({valide: true}).eq('id', audit.id);
