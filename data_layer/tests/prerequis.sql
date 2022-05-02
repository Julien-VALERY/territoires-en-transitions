begin;
select plan(6);

select has_function('labellisation', 'referentiel_score'::name);
select has_function('labellisation', 'etoiles'::name);
select has_function('labellisation_parcours');

truncate action_statut;

-- insert faked client scores, sort of.
truncate client_scores;
insert into client_scores
select 1,
       ar.referentiel,
       jsonb_agg(jsonb_build_object(
               'concerne', true,
               'action_id', ar.action_id,
               'desactive', false,
               'point_fait', 2,
               'referentiel', ar.referentiel,
               'point_pas_fait', 0.0,
               'point_potentiel', 2,
               'point_programme', 0.0,
               'point_referentiel', 2,
               'total_taches_count', 1,
               'point_non_renseigne', 0,
               'point_potentiel_perso', null,
               'completed_taches_count', 1,
               'fait_taches_avancement', 1,
               'pas_fait_taches_avancement', 0,
               'programme_taches_avancement', 0,
               'pas_concerne_taches_avancement', 0
           )),
       now()
from action_definition ar
group by ar.referentiel;


select ok((select score_fait = 100
                      and score_programme = 0
                      and completude = 1
                      and complet
           from labellisation.referentiel_score(1)
           where referentiel = 'eci'),
          'Labellisation scores function should output correct scores and completude for test data.');

select ok((select etoile_labellise = '1'
                      and prochaine_etoile_labellisation = '2'
                      and etoile_score_possible = '5'
                      and etoile_objectif = '5'
           from labellisation.etoiles(1)
           where referentiel = 'eci'),
          'Labellisation étoiles function should output correct state for test data.');

select ok((select etoiles = '5'
                      and completude_ok
                      and rempli
                      and calendrier is not null
                      and derniere_demande is null
           from labellisation_parcours(1)
           where referentiel = 'eci'),
          'Labellisation parcours function should output correct state for test data.');

rollback;
