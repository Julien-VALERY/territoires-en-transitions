-- Deploy tet:plan_action to pg

BEGIN;
create type migration.fiche_action_avancement as enum ('pas_fait', 'fait', 'en_cours', 'non_renseigne');
create table migration.fiche_action as select * from public.fiche_action;
alter table migration.fiche_action drop column avancement;
alter table migration.fiche_action add column avancement  migration.fiche_action_avancement not null;
update migration.fiche_action m set avancement = (select p.avancement::text::migration.fiche_action_avancement
                                                  from public.fiche_action p
                                                  where p.uid = m.uid);
create table migration.fiche_action_action as select * from public.fiche_action_action;
create table migration.fiche_action_indicateur as select * from public.fiche_action_indicateur;
create table migration.fiche_action_indicateur_personnalise as select * from public.fiche_action_indicateur_personnalise;
create table migration.plan_action as select * from public.plan_action;


drop materialized view stats.collectivite_plan_action cascade;
drop trigger after_collectivite_insert on collectivite;
drop function after_collectivite_insert_default_plan();
drop table plan_action cascade;
drop trigger after_fiche_action_write on fiche_action;
drop function after_fiche_action_write_save_relationships();
drop function update_fiche_relationships(fiche_action_uid uuid, action_ids action_id[], indicateur_ids
    indicateur_id[], indicateur_personnalise_ids integer[]);
drop table fiche_action_indicateur_personnalise;
drop table fiche_action_indicateur;
drop table fiche_action_action;
drop table fiche_action cascade;
drop type fiche_action_avancement;

create type fiche_action_thematiques as enum(
    'Agriculture et alimentation',
    'Bâtiments',
    'Consommation responsable',
    'Déchets',
    'Développement économique',
    'Eau',
    'Forêts, biodiversité et espaces verts',
    'Formation, sensibilisation, communication',
    'Gestion, production et distribution de l’énergie',
    'Mobilité',
    'Organisation interne',
    'Partenariats et coopération',
    'Précarité énergétique',
    'Stratégie',
    'Tourisme',
    'Urbanisme et aménagement'
    );

create type fiche_action_piliers_eci as enum (
    'Approvisionnement durable',
    'Écoconception',
    'Écologie industrielle (et territoriale)',
    'Économie de la fonctionnalité',
    'Consommation responsable',
    'Allongement de la durée d’usage',
    'Recyclage'
    );

create type fiche_action_resultats_attendus as enum (
    'Adaptation au changement climatique',
    'Sensibilisation',
    'Réduction des polluants atmosphériques',
    'Réduction des émissions de gaz à effet de serre',
    'Sobriété énergétique',
    'Efficacité énergétique',
    'Développement des énergies renouvelables'
    );

create type fiche_action_cibles as enum(
    'Grand public et associations',
    'Autres collectivités du territoire',
    'Acteurs économiques'
    );

create type fiche_action_statuts as enum(
    'À venir',
    'En cours',
    'Réalisé',
    'En pause',
    'Abandonné'
    );

create type fiche_action_niveaux_priorite as enum(
    'Élevé',
    'Moyen',
    'Bas'
    );

-- TAG
create table tag -- table abstraite
(
    nom text not null,
    collectivite_id integer references collectivite not null,
    unique(nom, collectivite_id)
);
alter table tag enable row level security;

-- FICHE ACTION
create table fiche_action
(
    id                      serial primary key,
    titre                   varchar(300),
    description             varchar(20000),
    thematiques             fiche_action_thematiques[],
    piliers_eci             fiche_action_piliers_eci[],
    objectifs               varchar(10000),
    resultats_attendus      fiche_action_resultats_attendus[],
    cibles                  fiche_action_cibles[],
    ressources              varchar(10000),-- Moyens humains et techniques
    financements            text,
    budget_previsionnel     integer,-- TODO Budget prévisionnel (20 digits max+espaces)
    statut                  fiche_action_statuts,
    niveau_priorite         fiche_action_niveaux_priorite,
    date_debut              timestamp with time zone,
    date_fin_provisoire     timestamp with time zone,
    amelioration_continue   boolean,-- Action en amélioration continue, sans date de fin
    calendrier              varchar(10000),
    notes_complementaires   varchar(20000),
    maj_termine             boolean,-- Mise à jour de la fiche terminée
    collectivite_id         integer references collectivite not null
);
alter table fiche_action enable row level security;
create policy allow_read on fiche_action for select using(is_authenticated());
create policy allow_insert on fiche_action for insert with check(have_edition_acces(collectivite_id));
create policy allow_update on fiche_action for update using(have_edition_acces(collectivite_id));
create policy allow_delete on fiche_action for delete using(have_edition_acces(collectivite_id));

create function peut_modifier_la_fiche(id_fiche integer) returns boolean as $$
begin
    return have_edition_acces((select fa.collectivite_id from fiche_action fa where fa.id = id_fiche limit 1));
end;
$$language plpgsql;

-- AXE
create table axe
(
    id serial primary key,
    nom text,
    collectivite_id integer references collectivite not null,
    parent integer references axe
);
alter table axe enable row level security;
create policy allow_read on axe for select using(is_authenticated());
create policy allow_insert on axe for insert with check(have_edition_acces(collectivite_id));
create policy allow_update on axe for update using(have_edition_acces(collectivite_id));
create policy allow_delete on axe for delete using(have_edition_acces(collectivite_id));

create table fiche_action_axe
(
    fiche_id integer references fiche_action not null,
    axe_id integer references axe not null,
    primary key (fiche_id, axe_id)
);
alter table fiche_action_axe enable row level security;
create policy allow_read on fiche_action_axe for select using(is_authenticated());
create policy allow_insert on fiche_action_axe for insert with check(peut_modifier_la_fiche(fiche_id));
create policy allow_update on fiche_action_axe for update using(peut_modifier_la_fiche(fiche_id));
create policy allow_delete on fiche_action_axe for delete using(peut_modifier_la_fiche(fiche_id));

create function ajouter_fiche_action_dans_un_axe(
    id_fiche integer,
    id_axe integer
) returns void as $$
begin
    insert into fiche_action_axe
    values (id_fiche, id_axe);
end;
$$ language plpgsql;
comment on function ajouter_fiche_action_dans_un_axe is 'Ajouter une fiche action dans un axe';

create function enlever_fiche_action_d_un_axe(
    id_fiche integer,
    id_axe integer
) returns void as $$
begin
    delete from fiche_action_axe
    where fiche_id = id_fiche and axe_id = id_axe;
end;
$$ language plpgsql;
comment on function enlever_fiche_action_d_un_axe is 'Enlever une fiche action d''un axe';

create function plans_action_collectivite(
    id_collectivite integer
) returns setof axe as $$
select axe.*
from axe
where axe.collectivite_id = id_collectivite
  and axe.parent = null;
$$ language sql;
comment on function plans_action_collectivite is 'Liste les plans action d''une collectivite';


-- PARTENAIRE
create table partenaire_tag
(
    id serial primary key,
    like tag including all
);
alter table partenaire_tag enable row level security;
create policy allow_read on partenaire_tag for select using(is_authenticated());
create policy allow_insert on partenaire_tag for insert with check(have_edition_acces(collectivite_id));
create policy allow_update on partenaire_tag for update using(have_edition_acces(collectivite_id));
create policy allow_delete on partenaire_tag for delete using(have_edition_acces(collectivite_id));

create table fiche_action_partenaire_tag(
                                            fiche_id integer references fiche_action not null,
                                            partenaire_tag_id integer references partenaire_tag not null,
                                            primary key (fiche_id, partenaire_tag_id)
);
alter table fiche_action_partenaire_tag enable row level security;
create policy allow_read on fiche_action_partenaire_tag for select using(is_authenticated());
create policy allow_insert on fiche_action_partenaire_tag for insert with check(peut_modifier_la_fiche(fiche_id));
create policy allow_update on fiche_action_partenaire_tag for update using(peut_modifier_la_fiche(fiche_id));
create policy allow_delete on fiche_action_partenaire_tag for delete using(peut_modifier_la_fiche(fiche_id));

create function ajouter_partenaire(
    id_fiche integer,
    partenaire partenaire_tag
) returns partenaire_tag as $$
declare
    id_tag integer;
begin
    id_tag = partenaire.id;
   if id_tag is null then
        insert into partenaire_tag (nom, collectivite_id)
        values(partenaire.nom, partenaire.collectivite_id)
        returning id into id_tag;
        partenaire.id = id_tag;
    end if;
    insert into fiche_action_partenaire_tag
    values (id_fiche, id_tag);
    return partenaire;
end;
$$ language plpgsql;
comment on function ajouter_partenaire is 'Ajouter un partenaire à la fiche';

create function enlever_partenaire(
    id_fiche integer,
    partenaire partenaire_tag
) returns void as $$
begin
    delete from fiche_action_partenaire_tag
    where fiche_id = id_fiche and partenaire_tag_id = partenaire.id;
end;
$$ language plpgsql;
comment on function enlever_partenaire is 'Enlever un partenaire à la fiche';

-- STRUCTURE PILOTE
create table structure_tag
(
    id serial primary key,
    like tag including all
);
alter table structure_tag enable row level security;
create policy allow_read on structure_tag for select using(is_authenticated());
create policy allow_insert on structure_tag for insert with check(have_edition_acces(collectivite_id));
create policy allow_update on structure_tag for update using(have_edition_acces(collectivite_id));
create policy allow_delete on structure_tag for delete using(have_edition_acces(collectivite_id));

create table fiche_action_structure_tag
(
    fiche_id integer references fiche_action not null,
    structure_tag_id integer references structure_tag not null,
    primary key (fiche_id, structure_tag_id)
);
alter table fiche_action_structure_tag enable row level security;
create policy allow_read on fiche_action_structure_tag for select using(is_authenticated());
create policy allow_insert on fiche_action_structure_tag for insert with check(peut_modifier_la_fiche(fiche_id));
create policy allow_update on fiche_action_structure_tag for update using(peut_modifier_la_fiche(fiche_id));
create policy allow_delete on fiche_action_structure_tag for delete using(peut_modifier_la_fiche(fiche_id));

create function ajouter_structure(
    id_fiche integer,
    structure structure_tag
) returns structure_tag as $$
declare
    id_tag integer;
begin
    id_tag = structure.id;
    if id_tag is null then
        insert into structure_tag (nom, collectivite_id)
        values (structure.nom, structure.collectivite_id)
        returning id into id_tag;
        structure.id = id_tag;
    end if;
    insert into fiche_action_structure_tag
    values (id_fiche, id_tag);
    return structure;
end;
$$ language plpgsql;
comment on function ajouter_structure is 'Ajouter une structure à la fiche';

create function enlever_structure(
    id_fiche integer,
    structure structure_tag
) returns void as $$
begin
    delete from fiche_action_structure_tag
    where fiche_id = id_fiche and structure_tag_id = structure.id;
end;
$$ language plpgsql;
comment on function enlever_structure is 'Enlever une structure à la fiche';

-- PERSONNE
create table personne_tag
(
    id serial primary key,
    like tag including all
);
alter table personne_tag enable row level security;
create policy allow_read on personne_tag for select using(is_authenticated());
create policy allow_insert on personne_tag for insert with check(have_edition_acces(collectivite_id));
create policy allow_update on personne_tag for update using(have_edition_acces(collectivite_id));
create policy allow_delete on personne_tag for delete using(have_edition_acces(collectivite_id));

create type personne as
(
    nom text,
    collectivite_id integer,
    personne_tag_id integer,
    utilisateur_uuid uuid
);

create function personnes_collectivite(
    id_collectivite integer
) returns setof personne as $$
select
    pt.nom,
    pt.collectivite_id,
    pt.id as personne_tag_id,
    null::uuid as utilisateur_uuid
from personne_tag pt
where pt.collectivite_id = id_collectivite
union
select
    concat(cm.prenom, ' ', cm.nom) as nom,
    id_collectivite as collectivite_id,
    null::integer as personne_tag_id,
    cm.user_id::uuid as utilisateur_uuid
from collectivite_membres(id_collectivite) cm;
$$ language sql;
comment on function personnes_collectivite is 'Liste les personnes (tags et utilisateurs) d''une collectivite';

-- PERSONNE PILOTE
create table fiche_action_pilote
(
    fiche_id integer references fiche_action not null,
    utilisateur_uuid uuid references auth.users,
    personne_tag_id integer references personne_tag,
    -- unique au lieu de primary key pour autoriser le null sur utilisateur ou tags
    unique(fiche_id, utilisateur_uuid, personne_tag_id)
);
alter table fiche_action_pilote enable row level security;
create policy allow_read on fiche_action_pilote for select using(is_authenticated());
create policy allow_insert on fiche_action_pilote for insert with check(peut_modifier_la_fiche(fiche_id));
create policy allow_update on fiche_action_pilote for update using(peut_modifier_la_fiche(fiche_id));
create policy allow_delete on fiche_action_pilote for delete using(peut_modifier_la_fiche(fiche_id));

create function ajouter_pilote(
    id_fiche integer,
    pilote personne
) returns personne as $$
declare
    id_tag integer;
begin
    if pilote.utilisateur_uuid is null then
        id_tag = pilote.personne_tag_id;
        if id_tag is null then
            insert into personne_tag (nom, collectivite_id)
            values (pilote.nom,  pilote.collectivite_id)
            returning id into id_tag;
            pilote.personne_tag_id = id_tag;
        end if;
        insert into fiche_action_pilote (fiche_id, utilisateur_uuid, personne_tag_id)
        values (id_fiche, null, id_tag);
    else
        insert into fiche_action_pilote (fiche_id, utilisateur_uuid, personne_tag_id)
        values (id_fiche, pilote.utilisateur_uuid, null);
    end if;
    return pilote;
end;
$$ language plpgsql;
comment on function ajouter_pilote is 'Ajouter un pilote à la fiche';

create function enlever_pilote(
    id_fiche integer,
    pilote personne
) returns void as $$
begin
    if pilote.utilisateur_uuid is null then
        delete from fiche_action_pilote
        where fiche_id = id_fiche and personne_tag_id = pilote.personne_tag_id;
    else
        delete from fiche_action_pilote
        where fiche_id = id_fiche and utilisateur_uuid = pilote.utilisateur_uuid;
    end if;

end;
$$ language plpgsql;
comment on function enlever_pilote is 'Enlever un pilote à la fiche';

-- REFERENT
create table fiche_action_referent
(
    fiche_id integer references fiche_action not null,
    utilisateur_uuid uuid references auth.users,
    personne_tag_id integer references personne_tag,
    -- unique au lieu de primary key pour autoriser le null sur utilisateur ou tag
    unique(fiche_id, utilisateur_uuid, personne_tag_id)
);
alter table fiche_action_referent enable row level security;
create policy allow_read on fiche_action_referent for select using(is_authenticated());
create policy allow_insert on fiche_action_referent for insert with check(peut_modifier_la_fiche(fiche_id));
create policy allow_update on fiche_action_referent for update using(peut_modifier_la_fiche(fiche_id));
create policy allow_delete on fiche_action_referent for delete using(peut_modifier_la_fiche(fiche_id));

create function ajouter_referent(
    id_fiche integer,
    referent personne
) returns personne as $$
declare
    id_tag integer;
begin
    if referent.utilisateur_uuid is null then
        id_tag = referent.personne_tag_id;
        if id_tag is null then
            insert into personne_tag (nom, collectivite_id)
            values (referent.nom,  referent.collectivite_id)
            returning id into id_tag;
            referent.personne_tag_id = id_tag;
        end if;
        insert into fiche_action_referent (fiche_id, utilisateur_uuid, personne_tag_id)
        values (id_fiche, null, id_tag);
    else
        insert into fiche_action_referent (fiche_id, utilisateur_uuid, personne_tag_id)
        values (id_fiche, referent.utilisateur_uuid, null);
    end if;
    return referent;
end;
$$ language plpgsql;
comment on function ajouter_referent is 'Ajouter un referent à la fiche';

create function enlever_referent(
    id_fiche integer,
    referent personne
) returns void as $$
begin
    if referent.utilisateur_uuid is null then
        delete from fiche_action_referent
        where fiche_id = id_fiche and personne_tag_id = referent.personne_tag_id;
    else
        delete from fiche_action_referent
        where fiche_id = id_fiche and utilisateur_uuid = referent.utilisateur_uuid;
    end if;

end;
$$ language plpgsql;
comment on function enlever_referent is 'Enlever un referent à la fiche';

-- ACTION
create table fiche_action_action
(
    fiche_id integer references fiche_action not null,
    action_id action_id references action_relation not null,
    primary key (fiche_id, action_id)
);
alter table fiche_action_action enable row level security;
create policy allow_read on fiche_action_action for select using(is_authenticated());
create policy allow_insert on fiche_action_action for insert with check(peut_modifier_la_fiche(fiche_id));
create policy allow_update on fiche_action_action for update using(peut_modifier_la_fiche(fiche_id));
create policy allow_delete on fiche_action_action for delete using(peut_modifier_la_fiche(fiche_id));

create function ajouter_action(
    id_fiche integer,
    id_action action_id
) returns void as $$
begin
    insert into fiche_action_action
    values (id_fiche, id_action);
end;
$$ language plpgsql;
comment on function ajouter_action is 'Ajouter une action à la fiche';

create function enlever_action(
    id_fiche integer,
    id_action action_id
) returns void as $$
begin
    delete from fiche_action_action
    where fiche_id = id_fiche and action_id = id_action;
end;
$$ language plpgsql;
comment on function enlever_action is 'Enlever une action à la fiche';


-- INDICATEUR
create table fiche_action_indicateur
(
    fiche_id integer references fiche_action not null,
    indicateur_id indicateur_id references indicateur_definition,
    indicateur_personnalise_id integer references indicateur_personnalise_definition,
    -- unique au lieu de primary key pour autoriser le null sur un des deux indicateur ids
    unique (fiche_id, indicateur_id, indicateur_personnalise_id)
);
alter table fiche_action_indicateur enable row level security;
create policy allow_read on fiche_action_indicateur for select using(is_authenticated());
create policy allow_insert on fiche_action_indicateur for insert with check(peut_modifier_la_fiche(fiche_id));
create policy allow_update on fiche_action_indicateur for update using(peut_modifier_la_fiche(fiche_id));
create policy allow_delete on fiche_action_indicateur for delete using(peut_modifier_la_fiche(fiche_id));

create type indicateur_global as
(
    indicateur_id indicateur_id,
    indicateur_personnalise_id integer,
    nom text,
    description text,
    unite text
);

create function ajouter_indicateur(
    id_fiche integer,
    indicateur indicateur_global
) returns void as $$
begin
    insert into fiche_action_indicateur (fiche_id, indicateur_id, indicateur_personnalise_id)
    values (id_fiche, indicateur.indicateur_id, indicateur.indicateur_personnalise_id);
end;
$$ language plpgsql;
comment on function ajouter_indicateur is 'Ajouter une indicateur à la fiche';

create function enlever_indicateur(
    id_fiche integer,
    indicateur indicateur_global
) returns void as $$
begin
    if indicateur.indicateur_id is null then
        delete from fiche_action_indicateur
        where fiche_id = id_fiche and indicateur_personnalise_id = indicateur.indicateur_personnalise_id;
    else
        delete from fiche_action_indicateur
        where fiche_id = id_fiche and indicateur_id = indicateur.indicateur_id;
    end if;
end;
$$ language plpgsql;
comment on function enlever_indicateur is 'Enlever une indicateur à la fiche';

create function indicateurs_collectivite(
    id_collectivite integer
) returns setof indicateur_global as $$
select
    null as indicateur_id,
    ipd.id as indicateur_personnalise_id,
    ipd.titre as nom,
    ipd.description,
    ipd.unite
from indicateur_personnalise_definition ipd
where ipd.collectivite_id = id_collectivite
union
select
    id.id as personne_tag_id,
    null as indicateur_personnalise_id,
    id.nom,
    id.description,
    id.unite
from indicateur_definition id
$$ language sql;
comment on function indicateurs_collectivite is 'Liste les indicateurs (globaux et personnalisés) d''une collectivite';

-- DOCUMENT ET LIEN
create table annexe
(
    id        serial primary key,
    like labellisation.preuve_base including all
);
alter table annexe enable row level security;
create policy allow_read on annexe for select using(is_authenticated());
create policy allow_insert on annexe for insert with check(have_edition_acces(collectivite_id));
create policy allow_update on annexe for update using(have_edition_acces(collectivite_id));
create policy allow_delete on annexe for delete using(have_edition_acces(collectivite_id));

create table fiche_action_annexe
(
    fiche_id integer references fiche_action not null,
    annexe_id integer references annexe not null,
    primary key (fiche_id, annexe_id)
);
alter table fiche_action_annexe enable row level security;
create policy allow_read on fiche_action_annexe for select using(is_authenticated());
create policy allow_insert on fiche_action_annexe for insert with check(peut_modifier_la_fiche(fiche_id));
create policy allow_update on fiche_action_annexe for update using(peut_modifier_la_fiche(fiche_id));
create policy allow_delete on fiche_action_annexe for delete using(peut_modifier_la_fiche(fiche_id));

create function ajouter_annexe(
    id_fiche integer,
    annexe annexe
) returns annexe as $$
declare
    id_annexe integer;
begin
    id_annexe = annexe.id;
    if id_annexe is null then
        insert into annexe (collectivite_id, fichier_id, url, titre, commentaire)
        values (annexe.collectivite_id, annexe.fichier_id, annexe.url, annexe.titre, annexe.commentaire)
        returning id into id_annexe;
        annexe.id = id_annexe;
    end if;
    insert into fiche_action_annexe (fiche_id, annexe_id)
    values (id_fiche, id_annexe);
    return annexe;
end;
$$ language plpgsql;
comment on function ajouter_annexe is 'Ajouter une annexe à la fiche';

create function enlever_annexe(
    id_fiche integer,
    annexe annexe,
    supprimer boolean
) returns void as $$
begin
    delete from fiche_action_annexe
    where fiche_id = id_fiche and annexe_id = annexe.id;
    if supprimer then
        delete from annexe where id = annexe.id;
    end if;
end;
$$ language plpgsql;
comment on function enlever_annexe is 'Enlever une annexe à la fiche';



-- Vue listant les fiches actions et ses données liées
create view fiches_action as
select fa.*,
       p.partenaires,
       s.structures,
       pi.pilotes,
       re.referents,
       anne.annexes,
       pla.plans_action,
       act.actions,
       ind.indicateurs
from fiche_action fa
         -- partenaires
         left join lateral (
    select array_agg(to_json(pt.*)) as partenaires
    from partenaire_tag pt
             join fiche_action_partenaire_tag fapt on fapt.partenaire_tag_id = pt.id
    where fapt.fiche_id = fa.id
    ) as p on true
    -- structures
         left join lateral (
    select array_agg(to_json(st.*)) as structures
    from structure_tag st
             join fiche_action_structure_tag fast on fast.structure_tag_id = st.id
    where fast.fiche_id = fa.id
    ) as s on true
    -- pilotes
         left join lateral (
    select array_agg(to_json(pil.*)) as pilotes
    from (
             select coalesce(pt.nom, concat(dcp.prenom, ' ', dcp.nom)) as nom,
                    pt.collectivite_id,
                    fap.personne_tag_id,
                    fap.utilisateur_uuid
             from fiche_action_pilote fap
                      left join personne_tag pt on fap.personne_tag_id = pt.id
                      left join dcp on fap.utilisateur_uuid = dcp.user_id
             where fap.fiche_id = fa.id
         ) pil
    ) as pi on true
    -- referents
         left join lateral (
    select array_agg(to_json(ref.*)) as referents
    from (
             select coalesce(pt.nom, concat(dcp.prenom, ' ', dcp.nom)) as nom,
                    pt.collectivite_id,
                    far.personne_tag_id,
                    far.utilisateur_uuid
             from fiche_action_referent far
                      left join personne_tag pt on far.personne_tag_id = pt.id
                      left join dcp on far.utilisateur_uuid = dcp.user_id
             where far.fiche_id = fa.id
         ) ref
    ) as re on true
    -- annexes
         left join lateral (
    select array_agg(to_json(a.*)) as annexes
    from annexe a
             join fiche_action_annexe faa on faa.annexe_id = a.id
    where faa.fiche_id = fa.id
    ) as anne on true
    -- plans action
         left join lateral (
    select array_agg(to_json(pa.*)) as plans_action
    from axe pa
             join fiche_action_axe fapa on fapa.axe_id = pa.id
    where fapa.fiche_id = fa.id
    ) as pla on true
    -- actions
         left join lateral (
    select array_agg(to_json(ar.*)) as actions
    from action_relation ar
             join fiche_action_action faa on faa.action_id = ar.id
    where faa.fiche_id = fa.id
    ) as act on true
    -- indicateurs
         left join lateral (
    select array_agg(to_json(indi.*)) as indicateurs
    from (
             select fai.indicateur_id,
                    fai.indicateur_personnalise_id,
                    coalesce(id.nom, ipd.titre) as nom,
                    coalesce(id.description, ipd.description) as description,
                    coalesce(id.unite, ipd.unite) as unite
             from fiche_action_indicateur fai
                      left join indicateur_definition id on fai.indicateur_id = id.id
                      left join indicateur_personnalise_definition ipd on fai.indicateur_personnalise_id = ipd.id
             where fai.fiche_id = fa.id
         ) indi
    ) as ind on true
-- TODO fiches liées (à calculer dans la vue selon action et indicateurs?)
;

-- Fonction récursive pour afficher un plan d'action
create or replace function plan_action(pa_id integer) returns jsonb as
$$
declare
    pa_enfant_id integer; -- Id d'un plan d'action enfant du plan d'action courant
    pa_nom text; -- Nom du plan d'action courant
    id_loop integer; -- Indice pour parcourir une boucle
    enfants jsonb[]; -- Plans d'actions enfants du plan d'action courant;
    fiches jsonb; -- Fiches actions du plan d'action courant
    to_return jsonb; -- JSON retournant le plan d'action courant, ses fiches et ses enfants
begin
    fiches = to_jsonb((select array_agg(fa.*)
                       from fiches_action fa
                                join fiche_action_axe fapa on fa.id = fapa.fiche_id
                       where fapa.axe_id = pa_id)) ;
    pa_nom = (select nom from axe where id = pa_id);
    id_loop = 1;
    for pa_enfant_id in
        select pa.id
        from axe pa
        where pa.parent = pa_id
        loop
            enfants[id_loop] = plan_action(pa_enfant_id);
            id_loop = id_loop + 1;
        end loop;

    to_return = jsonb_build_object('id', pa_id,
                                   'nom', pa_nom,
                                   'fiches', fiches,
                                   'enfants', enfants);
    return to_return;
end;
$$ language plpgsql;
comment on function plan_action is
    'Fonction retournant un JSON contenant le plan d''action passé en paramètre,
    ses fiches et ses plans d''actions enfants de manière récursive';

-- Droits





/*
-- Transfert donnees
do $$
    declare
        mpa migration.plan_action;
        mfa migration.fiche_action;
        id_loop_pa integer;
        id_loop_fa integer;
        st fiche_action_statuts;
        part_ids integer[];
        stru_ids integer[];
        refe_ids integer[];
    begin
        id_loop_pa = 1;
        for mpa in select * from migration.plan_action
            loop
            -- TODO récupérer categories en tant que plan_action enfant et les fiches liées au catégories
                insert into plan_action (id, nom, collectivite_id, parent)
                values (id_loop_pa, mpa.nom, mpa.collectivite_id, null);
                id_loop_pa = id_loop_pa + 1;
            end loop;

        id_loop_fa = 1;
        for mfa in select * from migration.fiche_action
            loop
                --Transforme fiche_action_avancement en fiche_action_statuts
                st = (
                    select case
                               when mfa.avancement = 'pas_fait'::migration.fiche_action_avancement
                                   then 'À venir'::public.fiche_action_statuts
                               when mfa.avancement = 'fait'::migration.fiche_action_avancement
                                   then 'Réalisé'::public.fiche_action_statuts
                               when mfa.avancement = 'en_cours'::migration.fiche_action_avancement
                                   then 'En cours'::public.fiche_action_statuts
                               when mfa.avancement = 'non_renseigne'::migration.fiche_action_avancement
                                   then 'En pause'::public.fiche_action_statuts
                               end as st
                );
                -- Fiche action
                insert into public.fiche_action(id, titre, description, budget_previsionnel, statut, amelioration_continue, collectivite_id)
                values(id_loop_fa, mfa.titre, mfa.description, mfa.budget_global, mfa.date_fin is null, mfa.collectivite_id);

                -- Structures
                insert into structures_tags (nom, collectivite_id)
                values(mfa.structure_pilote, mfa.collectivite_id)
                on conflict do nothing;
                stru_ids = (select array_agg(t.id)
                            from structures_tags t
                            where t.nom = mfa.structure_pilote
                              and t.collectivite_id = mfa.collectivite_id);

                -- Referents
                insert into users_tags (nom, collectivite_id)
                values(mfa.elu_referent, mfa.collectivite_id),
                      (mfa.personne_referente, mfa.collectivite_id)
                on conflict do nothing;
                refe_ids =(select array_agg(t.id)
                           from users_tags t
                           where (t.nom = mfa.elu_referent or t.nom = mfa.personne_referente)
                             and t.collectivite_id = mfa.collectivite_id);

                -- Partenaires
                insert into partenaires_tags (nom, collectivite_id)
                values(mfa.partenaires, mfa.collectivite_id)
                on conflict do nothing;
                part_ids =(select array_agg(t.id)
                           from partenaires_tags t
                           where t.nom = mfa.partenaires
                             and t.collectivite_id = mfa.collectivite_id);

                -- Plan action
                select * from migration.fiche_action_

                select upsert_fiche_action_liens(
                               id_loop_fa,
                               part_ids,
                               stru_ids,
                               array[]::integer[],
                               array[]::uuid[],
                               refe_ids,
                               array[]::uuid[],
                               array[]::integer[],
                               array []::integer[],
                               mfa.action_ids,
                               mfa.indicateur_ids,
                               mfa.indicateur_personnalise_ids
                           );

                id_loop_fa = id_loop_fa +1;
            end loop;
    end
$$;
 */

create materialized view stats.collectivite_plan_action
as
with fa as (select collectivite_id,
                   count(*) as count
            from fiche_action f
            group by f.collectivite_id),
     pa as (select collectivite_id,
                   count(*) as count
            from axe p
            where p.parent is null
            group by p.collectivite_id)
select c.*,
       coalesce(fa.count, 0) as fiches,
       coalesce(pa.count, 0) as plans
from stats.collectivite c
         left join pa on pa.collectivite_id = c.collectivite_id
         left join fa on pa.collectivite_id = fa.collectivite_id
order by fiches desc;

COMMIT;