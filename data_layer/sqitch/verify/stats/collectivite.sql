-- Verify tet:stats/collectivite on pg

BEGIN;

select collectivite_id
from stats.collectivite_active
where false;

select date, count, cumulated_count
from stats_unique_active_collectivite
where false;

select date, count, cumulated_count
from stats_rattachements
where false;

ROLLBACK;
