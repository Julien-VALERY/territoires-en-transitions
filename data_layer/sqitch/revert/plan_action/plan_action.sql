-- Deploy tet:plan_action to pg

BEGIN;

drop materialized view stats.collectivite_plan_action cascade;
drop view fiches_action;
drop function recursive_plan_action;
drop function upsert_fiche_action_liens;
drop function upsert_fiche_action_indicateur_personnalise;
drop function upsert_fiche_action_indicateur;
drop function upsert_fiche_action_action;
drop function upsert_fiche_action_plan_action;
drop function upsert_fiche_action_annexes;
drop function upsert_fiche_action_referents;
drop function upsert_fiche_action_pilotes;
drop function upsert_fiche_action_structures;
drop function upsert_fiche_action_partenaires;
drop table fiche_action_annexes;
drop table annexes cascade;
drop table fiche_action_indicateur_personnalise;
drop table fiche_action_indicateur;
drop table fiche_action_action;
drop table fiche_action_referents;
drop table fiche_action_pilotes;
drop table users_tags cascade;
drop table fiche_action_structures_tags;
drop table structures_tags cascade;
drop table fiche_action_partenaires_tags;
drop table partenaires_tags cascade;
drop table tags;
drop table fiche_action_plan_action;
drop table plan_action cascade;
drop table fiche_action cascade;
drop type fiche_action_niveaux_priorite cascade;
drop type fiche_action_statuts cascade;
drop type fiche_action_cibles cascade;
drop type fiche_action_resultats_attendus cascade;
drop type fiche_action_piliers_eci cascade;
drop type fiche_action_thematiques cascade;

create type fiche_action_avancement as enum ('pas_fait', 'fait', 'en_cours', 'non_renseigne');

-- fiche action
create table fiche_action
(
    uid                         uuid primary key,
    collectivite_id             integer references collectivite,
    avancement                  fiche_action_avancement not null,
    numerotation                text                    not null,
    titre                       text                    not null,
    description                 text                    not null,
    structure_pilote            text                    not null,
    personne_referente          text                    not null,
    elu_referent                text                    not null,
    partenaires                 text                    not null,
    budget_global               integer                 not null,
    commentaire                 text                    not null,
    date_fin                    text                    not null,
    date_debut                  text                    not null,
    en_retard                   boolean                 not null,
    -- relations to other tables
    action_ids                  action_id[]             not null,
    indicateur_ids              indicateur_id[]         not null,
    indicateur_personnalise_ids integer[]               not null
) inherits (abstract_modified_at);
comment on table fiche_action is 'Fiche action used by the client';

create trigger set_modified_at_before_fiche_action_update
    before update
    on
        fiche_action
    for each row
execute procedure update_modified_at();

alter table fiche_action
    enable row level security;

create policy allow_read
    on fiche_action
    for select
    using (is_authenticated());

create policy allow_insert
    on fiche_action
    with check (have_edition_acces(collectivite_id));

create policy allow_update
    on fiche_action
    using (have_edition_acces(collectivite_id));


create table fiche_action_action
(
    fiche_action_uid uuid references fiche_action,
    action_id        action_id references action_relation,
    primary key (fiche_action_uid, action_id)
);
comment on table fiche_action is
    'Many-to-many relationship between fiche action and referentiel action';
alter table fiche_action_action
    enable row level security;

create policy allow_read
    on fiche_action_action
    for select
    using (is_authenticated());


create table fiche_action_indicateur
(
    fiche_action_uid uuid references fiche_action,
    indicateur_id    indicateur_id references indicateur_definition,
    primary key (fiche_action_uid, indicateur_id)
);
comment on table fiche_action_indicateur is
    'Many-to-many relationship between fiche action and referentiel indicateur';
alter table fiche_action_indicateur
    enable row level security;
create policy allow_read
    on fiche_action_indicateur
    for select
    using (is_authenticated());

create table fiche_action_indicateur_personnalise
(
    fiche_action_uid           uuid references fiche_action,
    indicateur_personnalise_id integer references indicateur_personnalise_definition,
    primary key (fiche_action_uid, indicateur_personnalise_id)
);
comment on table fiche_action_indicateur_personnalise is
    'Many-to-many relationship between fiche action and indicateur personnalisé';
alter table fiche_action_indicateur_personnalise
    enable row level security;
create policy allow_read
    on fiche_action_indicateur_personnalise
    for select
    using (is_authenticated());


create or replace function update_fiche_relationships(
    fiche_action_uid uuid,
    action_ids action_id[],
    indicateur_ids indicateur_id[],
    indicateur_personnalise_ids integer[]
) returns void as
$$
declare
    uid uuid;
    i   action_id;
    j   indicateur_id;
    k   integer;
begin
    -- the name fiche_action_id is ambiguous as it can refer to a column.
    select update_fiche_relationships.fiche_action_uid into uid;

    -- clear previous relationships
    delete from fiche_action_action where fiche_action_action.fiche_action_uid = uid;
    delete from fiche_action_indicateur where fiche_action_indicateur.fiche_action_uid = uid;
    delete from fiche_action_indicateur_personnalise where fiche_action_indicateur_personnalise.fiche_action_uid = uid;

    -- write relationships
    foreach i in array action_ids
        loop
            insert into fiche_action_action (fiche_action_uid, action_id)
            values (uid, i);
        end loop;

    foreach j in array indicateur_ids
        loop
            insert into fiche_action_indicateur (fiche_action_uid, indicateur_id)
            values (uid, j);
        end loop;

    foreach k in array indicateur_personnalise_ids
        loop
            insert into fiche_action_indicateur_personnalise (fiche_action_uid, indicateur_personnalise_id)
            values (uid, k);
        end loop;
end;
$$
    language plpgsql security definer ;
comment on function update_fiche_relationships is
    'Update fiche action relationships with actions, indicateurs and indicateurs personnalisés';


create or replace function after_fiche_action_write_save_relationships() returns trigger as
$$
begin
    perform update_fiche_relationships(
            new.uid,
            new.action_ids,
            new.indicateur_ids,
            new.indicateur_personnalise_ids
        );
    return new;
end;
$$ language plpgsql;

create trigger after_fiche_action_write
    after insert or update
    on fiche_action
    for each row
execute procedure after_fiche_action_write_save_relationships();

comment on function after_fiche_action_write_save_relationships is
    'Save relationships with actions, indicateurs and indicateurs personnalisés '
        'from fiche action data on insert or update to ensure they are correct';

-- plan d'action
create table plan_action
(
    uid                uuid primary key,
    collectivite_id    integer references collectivite,
    nom                varchar(300)                                       not null,
    categories         jsonb                                              not null,
    fiches_by_category jsonb                                              not null,
    created_at         timestamp with time zone default CURRENT_TIMESTAMP not null,
    modified_at        timestamp with time zone default CURRENT_TIMESTAMP not null
);

create trigger set_modified_at_before_plan_action_update
    before update
    on
        plan_action
    for each row
execute procedure update_modified_at();


alter table plan_action
    enable row level security;

create policy allow_read
    on plan_action
    for select
    using (is_authenticated());


create policy allow_insert
    on plan_action
    with check (have_edition_acces(collectivite_id));

create policy allow_update
    on plan_action
    using (have_edition_acces(collectivite_id));



-- plan d'action par défaut
create or replace function after_collectivite_insert_default_plan() returns trigger as
$$
begin
    insert into plan_action
    (collectivite_id,
     uid,
     nom,
     categories,
     fiches_by_category)
    values (new.id,
            gen_random_uuid(),
            'Plan d''action de la collectivité',
            '[]',
            '[]');
    return new;
end;
$$ language plpgsql;

create trigger after_collectivite_insert
    after insert
    on collectivite
    for each row
execute procedure after_collectivite_insert_default_plan();

-- TODO recupère les données avant migration
drop table migration.plan_action;
drop table migration.fiche_action_indicateur_personnalise;
drop table migration.fiche_action_indicateur;
drop table migration.fiche_action_action;
drop table migration.fiche_action;
drop type migration.fiche_action_avancement;

create materialized view stats.collectivite_plan_action
as
with fa as (select collectivite_id,
                   count(*) as count
            from fiche_action f
            group by f.collectivite_id),
     pa as (select collectivite_id,
                   count(*) as count
            from plan_action p
            group by p.collectivite_id)
select c.*,
       coalesce(fa.count, 0) as fiches,
       coalesce(pa.count, 0) as plans
from stats.collectivite c
         left join pa on pa.collectivite_id = c.collectivite_id
         left join fa on pa.collectivite_id = fa.collectivite_id
order by fiches desc;


COMMIT;