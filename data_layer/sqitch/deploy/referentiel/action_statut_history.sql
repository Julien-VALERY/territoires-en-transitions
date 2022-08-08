-- Deploy tet:referentiel/action_statut_history to pg
-- requires: referentiel/action_statut

BEGIN;

create table history.action_statut
(
    collectivite_id              integer,
    action_id                    action_id,
    avancement                   avancement,
    previous_avancement          avancement,
    avancement_detaille          numeric[],
    previous_avancement_detaille numeric[],
    concerne                     boolean,
    previous_concerne            boolean,
    modified_by                  uuid,
    previous_modified_by         uuid,
    modified_at                  timestamp with time zone,
    previous_modified_at         timestamp with time zone
);

alter table history.action_statut enable row level security;


create function history.save_action_statut() returns trigger
as
$$
begin
    insert into history.action_statut
    values (new.collectivite_id,
            new.action_id,
            new.avancement,
            old.avancement,
            new.avancement_detaille,
            old.avancement_detaille,
            new.concerne,
            old.concerne,
            auth.uid(),
            old.modified_by,
            new.modified_at,
            old.modified_at);
    return new;
end;
$$ language plpgsql security definer ;

create trigger save_history
    after insert or update
    on action_statut
    for each row
execute procedure history.save_action_statut();


create view historical_action_statut
as
with action_history as (select *
                        from history.action_statut
                        order by modified_at desc),
     actions as (select * from action_hierarchy ah where ah.type = 'action')
select h.action_id                                         as tache_id,
       ah.action_id                                        as action_id,
       td.identifiant                                      as tache_identifiant,
       td.nom                                              as tache_nom,
       ad.identifiant                                      as action_identifiant,
       ad.nom                                              as action_nom,
       collectivite_id,
       avancement,
       previous_avancement,
       avancement_detaille,
       previous_avancement_detaille,
       concerne,
       previous_concerne,
       modified_by,
       h.modified_at,
       coalesce(ud.prenom || ' ' || ud.nom, 'Équipe territoires en transitions') as nom
from action_history h
         join actions ah on h.action_id = any (ah.descendants)
         join action_definition ad on ah.action_id = ad.action_id -- definition de l'action
         join action_definition td on h.action_id = td.action_id -- definition de la tache
         left join utilisateur.dcp_display ud on h.modified_by = ud.user_id
;
comment on view historical_action_statut is
    'Historique des modification des statuts.';

COMMIT;
