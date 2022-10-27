import {useMutation, useQueryClient} from 'react-query';

import {supabaseClient} from 'core-logic/api/supabase';
import {TActionDiscussionCommentaire} from './types';

/**
 * Supprime un commentaire d'une discussion
 */
export const useDeleteCommentaireFromDiscussion = () => {
  const queryClient = useQueryClient();

  return useMutation(deleteCommentaire, {
    mutationKey: 'delete-commentaire-from-discussion',
    onSuccess: () => {
      queryClient.invalidateQueries(['action_discussion_feed']);
    },
  });
};

const deleteCommentaire = async (commentaire_id: number) => {
  const {error} = await supabaseClient
    .from<TActionDiscussionCommentaire>('action_discussion_commentaire')
    .delete()
    .eq('id', commentaire_id);

  if (error) throw error?.message;
};
