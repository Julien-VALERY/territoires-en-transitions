-- Verify tet:stats/completude on pg

BEGIN;

select lower_bound, upper_bound, eci, cae
from stats_tranche_completude where false;

ROLLBACK;
