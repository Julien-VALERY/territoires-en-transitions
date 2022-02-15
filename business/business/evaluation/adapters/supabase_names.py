from marshmallow_dataclass import dataclass


@dataclass
class tables:
    business_action_statut = "business_action_statut"
    client_scores = "client_scores"
    unprocessed_action_statut_event = "unprocessed_action_statut_update_event"
    indicateur_definition = "indicateur_definition"
    indicateur_action = "indicateur_action"
    action_relation = "action_relation"
    action_definition = "action_definition"
    action_computed_points = "action_computed_points"
    business_action_children = "business_action_children"


@dataclass
class rpc:
    upsert_indicateurs = "upsert_indicateurs"
