-- Deploy tet:scores_events to pg
-- requires: referentiel
-- requires: droits
-- requires: client_scores
-- requires: base

BEGIN;

create view unprocessed_action_statut_update_event
as
with
    -- equivalent to active collectivite
    unique_collectivite_droit as (
        select named_collectivite.collectivite_id, min(created_at) as max_date
        from named_collectivite
                 join private_utilisateur_droit
                      on named_collectivite.collectivite_id = private_utilisateur_droit.collectivite_id
        where private_utilisateur_droit.active
        group by named_collectivite.collectivite_id
    ),
    -- virtual events, so we consider someone joining a collectivite as a statuts update
    virtual_inital_event as (
        select collectivite_id,
               unnest('{eci, cae}'::referentiel[]) as referentiel,
               max_date
        from unique_collectivite_droit
    ),
    -- the latest from virtual and action statut update event
    latest_event as (
        select v.collectivite_id,
               v.referentiel,
               max(coalesce(v.max_date, r.created_at)) as max_date
        from virtual_inital_event v
                 full join action_statut_update_event r on r.collectivite_id = v.collectivite_id
        group by v.collectivite_id, v.referentiel
    ),
    -- last time points where updated for a referentiel
    latest_referentiel_modification as (
        select referentiel, max(modified_at) as referentiel_last_modified_at
        from action_computed_points acp
                 left join action_relation ar on ar.id = acp.action_id
        group by (referentiel)
    ),
    -- score require to be processed either if a statut is updated or if computed_points changed
    latest_score_update_required as (
        select collectivite_id, r.referentiel, GREATEST(e.max_date::timestamp,
                                                        r.referentiel_last_modified_at::timestamp) as required_at
        from latest_event e
                 left join latest_referentiel_modification r on r.referentiel = e.referentiel
    ),
    -- events that are not processed
    unprocessed as (
        select *
        from latest_score_update_required lsur
        where collectivite_id not in (
            -- processed means that the score is more recent than the event
            select collectivite_id
            from client_scores s
            where s.score_created_at > lsur.required_at
        )
    )
select unprocessed.collectivite_id,
       unprocessed.referentiel,
       unprocessed.required_at as created_at
from unprocessed;
comment on view unprocessed_action_statut_update_event is
    'To be used by business to compute only what is necessary.';

COMMIT;
