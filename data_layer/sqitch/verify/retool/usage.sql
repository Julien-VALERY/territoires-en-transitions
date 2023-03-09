-- Verify tet:retool/usage on pg

BEGIN;

select
    collectivite_id,
    code_siren_insee,
    nom,
    region_name,
    region_code,
    departement_name,
    departement_code,
    type_collectivite,
    nature_collectivite,
    population_totale,
    cot,
    niveau_label_cae,
    realise_label_cae,
    programme_label_cae,
    completude_cae,
    realise_courant_cae,
    programme_courant_cae,
    niveau_label_eci,
    realise_label_eci,
    programme_label_eci,
    completude_eci,
    realise_courant_eci,
    programme_courant_eci,
    nb_plans,
    nb_fiches,
    nb_indicateurs,
    nb_indicateurs_cae,
    nb_indicateurs_eci,
    nb_valeurs_indicateurs,
    nb_indicateurs_personnalises,
    nb_users_actifs,
    nb_admin,
    nb_ecriture,
    nb_lecture,
    admin_prenom_1,
    admin_nom_1,
    admin_fonction_1,
    admin_detail_fonction_1,
    admin_champs_intervention_1,
    admin_email_1,
    admin_telephone_1,
    admin_derniere_connexion_1,
    admin_prenom_2,
    admin_nom_2,
    admin_fonction_2,
    admin_detail_fonction_2,
    admin_champs_intervention_2,
    admin_email_2,
    admin_telephone_2,
    admin_derniere_connexion_2,
    admin_prenom_3,
    admin_nom_3,
    admin_fonction_3,
    admin_detail_fonction_3,
    admin_champs_intervention_3,
    admin_email_3,
    admin_telephone_3,
    admin_derniere_connexion_3,
    admin_prenom_4,
    admin_nom_4,
    admin_fonction_4,
    admin_detail_fonction_4,
    admin_champs_intervention_4,
    admin_email_4,
    admin_telephone_4,
    admin_derniere_connexion_4,
    admin_prenom_5,
    admin_nom_5,
    admin_fonction_5,
    admin_detail_fonction_5,
    admin_champs_intervention_5,
    admin_email_5,
    admin_telephone_5,
    admin_derniere_connexion_5,
    admin_prenom_6,
    admin_nom_6,
    admin_fonction_6,
    admin_detail_fonction_6,
    admin_champs_intervention_6,
    admin_email_6,
    admin_telephone_6,
    admin_derniere_connexion_6,
    admin_prenom_7,
    admin_nom_7,
    admin_fonction_7,
    admin_detail_fonction_7,
    admin_champs_intervention_7,
    admin_email_7,
    admin_telephone_7,
    admin_derniere_connexion_7,
    admin_prenom_8,
    admin_nom_8,
    admin_fonction_8,
    admin_detail_fonction_8,
    admin_champs_intervention_8,
    admin_email_8,
    admin_telephone_8,
    admin_derniere_connexion_8,
    admin_prenom_9,
    admin_nom_9,
    admin_fonction_9,
    admin_detail_fonction_9,
    admin_champs_intervention_9,
    admin_email_9,
    admin_telephone_9,
    admin_derniere_connexion_9,
    admin_prenom_10,
    admin_nom_10,
    admin_fonction_10,
    admin_detail_fonction_10,
    admin_champs_intervention_10,
    admin_email_10,
    admin_telephone_10,
    admin_derniere_connexion_10
from retool_stats_usages
where false;

ROLLBACK;
