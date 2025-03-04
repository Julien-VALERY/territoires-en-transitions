import {useCallback} from 'react';
import {TCellProps} from './DetailTacheTable';
import {SelectStatut} from './SelectStatut';

/** Affiche le sélecteur permettant de mettre à jour le statut d'une tâche */
export const CellStatut = ({row, value, updateStatut}: TCellProps) => {
  const {have_children, action_id} = row.original;

  const handleChange = useCallback(
    (value: string) => {
      updateStatut(action_id, value);
    },
    [action_id]
  );

  const currentValue = value || 'non_renseigne';

  return have_children ? null : (
    <SelectStatut
      action_id={action_id}
      value={currentValue}
      onChange={handleChange}
    />
  );
};
