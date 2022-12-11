create view test.referentiel_points
as
select a.referentiel,
       a.action_id,
       r.parent,
       p.value,
       a.have_children,
       a.depth,
       array_length(a.leaves, 1) as taches
from action_referentiel a
         join action_computed_points p using (action_id)
         join action_relation r on a.action_id = r.id;
comment on view test.referentiel_points
    is 'Les informations nécessaire pour calculer les points des actions des référentiels.';


create type test.statut_detaille as
(
    collectivite_id integer,
    action_id       action_id,
    fait            float,
    programme       float,
    pas_fait        float
);
comment on type test.statut_detaille
    is 'Les statuts convertis en statuts détaillés.';


create function
    test.statut_to_detaille(statut action_statut)
    returns test.statut_detaille
    language sql immutable
begin
    atomic
    select statut.collectivite_id,
           statut.action_id,
           case
               when statut.avancement = 'fait' then 1.0
               when statut.avancement = 'detaille' then statut.avancement_detaille[1]
               else .0 end as fait,
           case
               when statut.avancement = 'programme' then 1.0
               when statut.avancement = 'detaille' then statut.avancement_detaille[2]
               else .0 end as programme,
           case
               when statut.avancement = 'pas_fait' then 1.0
               when statut.avancement = 'detaille' then statut.avancement_detaille[3]
               else .0 end as pas_fait;
end;
comment on function test.statut_to_detaille is
    'Convertit un statut en statut détaillé.';


create function
    test_generate_fake_scores(collectivite_id integer, referentiel referentiel, statuts test.statut_detaille[])
    returns jsonb
    language plpgsql
as
$$
declare
    d      integer;
    scores jsonb;
begin
    -- stocke les scores dans une table temporaire pour le calcul
    drop table if exists fake_scores;
    create temporary table fake_scores
    (
        referentiel referentiel,
        action_id   action_id,
        parent      action_id,
        points      float,
        depth       integer,
        fait        float,
        programme   float,
        pas_fait    float,
        completed   integer,
        primary key (action_id)
    ) on commit drop;

    -- on y insert les points des statuts
    with statut_detaille as (select *
                             from unnest(test_generate_fake_scores.statuts))
    insert
    into fake_scores
    select p.referentiel,
           p.action_id,
           p.parent,
           p.value,
           p.depth,
           coalesce(s.fait, .0) * p.value,
           coalesce(s.programme, .0) * p.value,
           coalesce(s.pas_fait, .0) * p.value,
           case when s is null then 0 else p.value end
    from test.referentiel_points p
             left join statut_detaille s
                       on s.action_id = p.action_id
                           and s.collectivite_id = test_generate_fake_scores.collectivite_id
                           and p.referentiel = test_generate_fake_scores.referentiel;

    -- puis pour chaque niveau on calcule les totaux pour obtenir une _approximation_
    for d in select generate_series(1, max(depth)) as depth from fake_scores order by depth desc
        loop
            insert into fake_scores (action_id, fait, programme, pas_fait, completed)
            select parent, sum(fait), sum(programme), sum(pas_fait), sum(completed)
            from fake_scores
            where depth = d
            group by parent
            on conflict (action_id) do update set fait      = excluded.fait,
                                                  programme = excluded.programme,
                                                  pas_fait  = excluded.pas_fait,
                                                  completed = excluded.completed;
        end loop;

    -- on construit un json comme le service d'évaluation
    with converted as (select fake_scores.action_id,
                              true                                 as concerne,
                              false                                as desactive,
                              points                               as point_referentiel,
                              points                               as point_potentiel,
                              points - fait - programme - pas_fait as point_non_renseigne,
                              fait                                 as point_fait,
                              programme                            as point_programme,
                              pas_fait                             as point_pas_fait,
                              taches                               as total_taches_count,
                              completed                            as completed_taches_count,
                              null                                 as point_potentiel_perso,
                              -- on ne calcule pas l'avancement car on ne s'en sert pas
                              .0                                   as fait_taches_avancement,
                              .0                                   as pas_fait_taches_avancement,
                              .0                                   as programme_taches_avancement,
                              .0                                   as pas_concerne_taches_avancement
                       from fake_scores
                                join test.referentiel_points p using (action_id))
    select into scores json_agg(to_json(converted))
    from converted;
    return scores;
end;
$$;
comment on function test_generate_fake_scores is
    'Génère des faux scores au même format que `client_scores`. '
        'Utilise une liste de statuts pour produire un résultat qui ressemble aux scores calculés par le service d''évaluation.';
