-- Deploy tet:referentiel/action_discussion to pg

BEGIN;

-- Enum action_discussion_statut
create type action_discussion_statut as enum ('ouvert', 'ferme');

-- Table discussion
create table action_discussion
(
    id              serial primary key,
    collectivite_id integer references collectivite                      not null,
    action_id       action_id references action_relation                 not null,
    created_by      uuid references auth.users default auth.uid()        not null,
    created_at      timestamp with time zone   default CURRENT_TIMESTAMP not null,
    modified_at     timestamp with time zone   default CURRENT_TIMESTAMP not null,
    status          action_discussion_statut   default 'ouvert'          not null
);

create trigger set_modified_at
    before update
    on action_discussion
    for each row
execute procedure update_modified_at();

-- Table action_discussion_commentaire
create table action_discussion_commentaire
(
    id            serial primary key,
    created_by    uuid references auth.users default auth.uid()        not null,
    created_at    timestamp with time zone   default CURRENT_TIMESTAMP not null,
    discussion_id integer references action_discussion                 not null,
    message       text                                                 not null
);

-- Vue action_discussion_feed
create view action_discussion_feed
as
with
    nom_commentaire as (select *, utilisateur.modified_by_nom(adc.created_by) as created_by_nom
                        from action_discussion_commentaire adc)
select ad.id,
       ad.collectivite_id,
       ad.action_id,
       ad.created_by,
       ad.created_at,
       ad.modified_at,
       ad.status,
       c.commentaires
from action_discussion ad
         left join lateral (
    select array_agg(to_jsonb(nc)) as commentaires
    from nom_commentaire nc
    where nc.discussion_id = ad.id
    ) as c on true
;

alter table action_discussion enable row level security;
alter table action_discussion_commentaire enable row level security;

-- Les discussions sont visibles par tous les membres de la collectivité.
create policy allow_read
    on action_discussion
    for select
    using (have_lecture_acces(collectivite_id));

-- La discussion peut être crée par tous les membres de la collectivité
create policy allow_insert
    on action_discussion
    for insert
    with check (have_lecture_acces(collectivite_id));

-- Le discussion peut être modifié par tous les membres de la collectivité
create policy allow_update
    on action_discussion
    for update
    using (have_lecture_acces(collectivite_id));

-- La discussion peut être supprimé par tous les membres de la collectivité
create policy allow_delete
    on action_discussion
    for delete
    using (have_lecture_acces(collectivite_id));

-- Les autres commentaires sont visibles par tous les membres de la collectivité.
create policy allow_read
    on action_discussion_commentaire
    for select
    using (have_lecture_acces((select collectivite_id
                               from action_discussion ad
                               where ad.id = discussion_id)));

-- Le commentaire peut être crée par tous les membres de la collectivité
create policy allow_insert
    on action_discussion_commentaire
    for insert
    with check (have_lecture_acces((select collectivite_id
                               from action_discussion ad
                               where ad.id = discussion_id)));

-- Le commentaire peut être modifié par son créateur.
create policy allow_update
    on action_discussion_commentaire
    for update
    using (auth.uid() = created_by);

-- Le commentaire peut être supprimé par son créateur ou l’un des membres participant au commentaire.
create policy allow_delete
    on action_discussion_commentaire
    for delete
    using (auth.uid() = created_by);


-- Supprimer une discussion si son dernier commentaires a été supprimé
create function supprimer_discussion() returns trigger as
$$
declare
    exist_adc integer;
begin
    exist_adc = (select count(*)
                 from action_discussion_commentaire adc
                 where adc.discussion_id = old.discussion_id);
    if exist_adc = 0 then
        delete from action_discussion where id = old.discussion_id;
    end if;
    return old;
end;
$$ language plpgsql;

-- Trigger sur suppression de action_discussion_commentaire
create trigger supprimer_commentaire_via_table
    after delete
    on action_discussion_commentaire
    for each row
execute procedure supprimer_discussion();

COMMIT;
