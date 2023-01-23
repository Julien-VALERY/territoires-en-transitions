import {Database} from "../../database.types.ts";
import {Personne} from "./personne.ts";
import {IndicateurGlobal} from "./indicateurGlobal.ts";

export type FicheActionVueRow = Database["public"]["Views"]["fiches_action"]["Row"] & {
    thematiques: Database["public"]["Tables"]["thematique"]["Insert"][] | null,
    sous_thematiques: Database["public"]["Tables"]["sous_thematique"]["Insert"][] | null,
    partenaires: Database["public"]["Tables"]["partenaire_tag"]["Insert"][] | null,
    structures: Database["public"]["Tables"]["structure_tag"]["Insert"][] | null,
    pilotes: Personne[] | null,
    referents: Personne[] | null,
    annexes: Database["public"]["Tables"]["annexe"]["Insert"][]  | null,
    axes: Database["public"]["Tables"]["axe"]["Insert"][]  | null,
    actions: Database["public"]["Tables"]["action_relation"]["Insert"][]  | null,
    indicateurs: IndicateurGlobal[] | null
};

export type FicheActionVueInsert = FicheActionVueRow;
export type FicheActionVueUpdate = FicheActionVueRow;
