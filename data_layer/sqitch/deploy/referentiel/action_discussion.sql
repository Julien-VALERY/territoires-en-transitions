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
create trigger supprimer_commentaire
    after delete
    on action_discussion_commentaire
    for each row
execute procedure supprimer_discussion();

-- Vue action_discussion_feed
create view action_discussion_feed
as
select ad.id,
       ad.collectivite_id,
       ad.action_id,
       ad.created_by,
       ad.created_at,
       ad.modified_at,
       ad.status,
       utilisateur.modified_by_nom(ad.created_by)                                                     as created_by_nom,
       (select array_agg(adc) from action_discussion_commentaire adc where adc.discussion_id = ad.id) as commentaires
from action_discussion ad;

-- Les autres commentaires sont visibles par tous les membres de la collectivité.
create policy allow_read
    on action_discussion_commentaire
    for select
    using (have_lecture_acces((select collectivite_id
                               from action_discussion ad
                               where ad.id = discussion_id)));

-- Le commentaire peut être modifié par son créateur.
create policy allow_update
    on action_discussion_commentaire
    for update
    using (created_by = auth.uid());

-- Le commentaire peut être supprimé par son créateur ou l’un des membres participant au commentaire.
create policy allow_delete
    on action_discussion_commentaire
    for update
    using (created_by = auth.uid());


---

create or replace function ajouter_commentaire() returns trigger as
$$
declare
    commentaire action_discussion_commentaire;
begin
    if new.id is null then
        insert into action_discussion(collectivite_id, action_id, status)
        values (new.collectivite_id, new.action_id, 'ouvert');
        new.id = currval('action_discussion_id_seq');
    end if;
    foreach commentaire in array new.commentaires
        loop
            insert into action_discussion_commentaire (discussion_id, message)
            values (new.id, commentaire.message);
        end loop;
    return new;
end;
$$ language plpgsql security definer;

create trigger upsert
    instead of insert
    on action_discussion_feed
    for each row
execute procedure ajouter_commentaire();


drop trigger if exists upsert on action_discussion_feed;
select test.identify_as('yolo@dodo.com');
select auth.uid();
insert into action_discussion_feed (collectivite_id, action_id, commentaires)
values (1, 'eci_1.1', '{}');

select *
from action_discussion_feed adf;

do
$$
    declare
        i            integer;
        commentaires action_discussion_commentaire[];
        commentaire  action_discussion_commentaire;
    begin
        --     for i in 1..5 loop
--     end loop;
        select 0,
               auth.uid(),
               now(),
               0,
               'yo'
        into commentaire;

        commentaires = '{}'::action_discussion_commentaire[];

        commentaires := commentaires || commentaire;

        raise notice 'commentaire %, commentaires: %', commentaire, commentaires;


        insert into action_discussion_feed (collectivite_id, action_id, commentaires, created_by)
        values (1, 'eci_1.1', commentaires, auth.uid());
    end
$$;

select * from action_discussion_feed;
select * from action_discussion_commentaire adc;

COMMIT;
