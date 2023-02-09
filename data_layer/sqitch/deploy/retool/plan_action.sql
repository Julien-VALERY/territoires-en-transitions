-- Deploy tet:retool/plan_action to pg

BEGIN;

/*
 Vue générale “usage” de la fonctionnalité :
 - nom collectivités
 - nombre de plans en ligne
 - nombre de fiches en ligne
 - date dernière modification d’une fiche
 - TODO nombre d’utilisateurs différents ayant agi sur l’onglet plans d’action
 */
create view retool_plan_action_usage as
select col.collectivite_id,
       col.nom,
       count(distinct axe.id) as nb_plans,
       count(distinct fac.id) as nb_fiches,
       max(fac.modified_at) as derniere_modif,
       null as nb_utilisateurs
from named_collectivite col
         left join axe on axe.collectivite_id = col.collectivite_id
         left join fiche_action fac on fac.collectivite_id = col.collectivite_id
where axe.parent is null
group by col.collectivite_id, col.nom;

/*
 Progression hebdo :
 - Nom collectivités
 - création d’une fiche la semaine passée
 - création d’un plan la semaine passée
 */
create view retool_plan_action_hebdo as
with
    weeks as (
        select *
        from generate_series(DATE '2021-01-04', now(), '7 day') day
    ),
    collectivites_by_weeks as (
        select nc.*, w.day
        from named_collectivite nc
                 left join lateral (select * from weeks) w on true
        order by nc.collectivite_id
    ),
    plans as (
        select cw.collectivite_id, cw.day, count(p.id) as nb_plans
        from collectivites_by_weeks cw
                 left join (select * from axe where parent is null) p
                           on p.collectivite_id = cw.collectivite_id
                               and p.created_at >= cw.day
                               and p.created_at < cw.day + interval '7 day'
        group by cw.collectivite_id, cw.day
    ),
    fiches as (
        select cw.collectivite_id, cw.day, count(f.id) as nb_fiches
        from collectivites_by_weeks cw
                 left join fiche_action f
                           on f.collectivite_id = cw.collectivite_id
                               and f.created_at >= cw.day
                               and f.created_at < cw.day + interval '7 day'
        group by cw.collectivite_id, cw.day
    )
select c.collectivite_id,
       c.nom,
       concat(c.day::date, ' - ', (c.day + interval '1' day)::date) as date_range,
       p.nb_plans,
       f.nb_fiches
from collectivites_by_weeks c
         join plans p on c.collectivite_id = p.collectivite_id and c.day = p.day
         join fiches f on c.collectivite_id = f.collectivite_id and c.day = f.day
order by c.collectivite_id, c.day;

COMMIT;
