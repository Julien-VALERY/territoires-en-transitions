-- Verify tet:stats/collectivite on pg

BEGIN;

select collectivite_id, nom
from stats_real_collectivites
where false;


ROLLBACK;
