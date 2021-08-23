import {ActionReferentiel} from 'generated/models/action_referentiel';

export const flattenActions = (
  actions: ActionReferentiel[],
  recursive: boolean
): ActionReferentiel[] => {
  const flattened: ActionReferentiel[] = [];
  for (const action of actions) {
    flattened.push(...action.actions);
    if (recursive) flattened.push(...flattenActions(action.actions, true));
  }

  return flattened;
};

export const actionsById = (
  actions: ActionReferentiel[]
): Map<string, ActionReferentiel> => {
  const results = new Map<string, ActionReferentiel>();
  const append = (actions: ActionReferentiel[]) => {
    for (const action of actions) {
      results.set(action.id, action);
      append(action.actions);
    }
  };
  append(actions);

  return results;
};

export const searchActionById = (
  actionId: string,
  actions: ActionReferentiel[]
): ActionReferentiel | null => {
  for (const action of actions) {
    if (actionId === action.id) return action;
    if (actionId.startsWith(action.id))
      return searchActionById(actionId, action.actions);
  }
  return null;
};
