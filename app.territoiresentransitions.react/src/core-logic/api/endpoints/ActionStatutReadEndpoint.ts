import {DataLayerReadCachedEndpoint} from 'core-logic/api/dataLayerEndpoint';
import {ActionStatutRead} from 'generated/dataLayer/action_statut_read';
import {PostgrestResponse} from '@supabase/supabase-js';
import {actionStatutWriteEndpoint} from 'core-logic/api/endpoints/ActionStatutWriteEndpoint';

export interface StatutGetParams {
  collectivite_id: number;
  action_id?: string;
}

export class ActionStatutReadEndpoint extends DataLayerReadCachedEndpoint<
  ActionStatutRead,
  StatutGetParams
> {
  readonly name = 'action_statut';

  async _read(
    getParams: StatutGetParams
  ): Promise<PostgrestResponse<ActionStatutRead>> {
    if (getParams.action_id)
      return this._table
        .eq('collectivite_id', getParams.collectivite_id)
        .eq('action_id', getParams.action_id);
    return this._table.eq('collectivite_id', getParams.collectivite_id);
  }
}

export const actionStatutReadEndpoint = new ActionStatutReadEndpoint([
  actionStatutWriteEndpoint,
]);
