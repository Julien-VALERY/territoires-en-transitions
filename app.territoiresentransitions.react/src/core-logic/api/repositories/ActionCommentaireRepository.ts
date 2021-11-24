import {actionCommentaireReadEndpoint} from 'core-logic/api/endpoints/ActionCommentaireReadEndpoint';
import {ActionCommentaireRead} from 'generated/dataLayer/action_commentaire_read';
import {ActionCommentaireWrite} from 'generated/dataLayer/action_commentaire_write';
import {actionCommentaireWriteEndpoint} from 'core-logic/api/endpoints/ActionCommentaireWriteEndpoint';

class ActionCommentaireRepository {
  save(
    commentaire: ActionCommentaireWrite
  ): Promise<ActionCommentaireWrite | null> {
    return actionCommentaireWriteEndpoint.save(commentaire);
  }

  async fetch(args: {
    epciId: number;
    actionId: string;
  }): Promise<ActionCommentaireRead | null> {
    const results = await actionCommentaireReadEndpoint.getBy({
      epci_id: args.epciId,
    });
    return results.find(statut => statut.action_id === args.actionId) || null;
  }
}

export const actionCommentaireRepository = new ActionCommentaireRepository();
