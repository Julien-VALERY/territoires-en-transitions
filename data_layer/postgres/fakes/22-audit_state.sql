insert into audit(id, collectivite_id, referentiel, auditeur)
values (1, 1, 'eci', '5f407fc6-3634-45ff-a988-301e9088096a');

insert into action_audit_state(audit_id, action_id, collectivite_id, ordre_du_jour, avis, statut, modified_by)
values
(1, 'eci_2.2', 1, true, 'avis test 2.2', 'en_cours', '5f407fc6-3634-45ff-a988-301e9088096a'),
(1, 'eci_2.3', 1, false, 'avis test 2.3', 'audite', '5f407fc6-3634-45ff-a988-301e9088096a'),
(1, 'eci_2.4', 1, true, 'avis test 2.4', 'non_audite', '5f407fc6-3634-45ff-a988-301e9088096a');
