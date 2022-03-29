import abc
from typing import Dict, List
from business.evaluation.domain.models.events import ReponseUpdatedForCollectivite

from business.personnalisation.models import ActionPersonnalisationConsequence, Reponse
from business.referentiel.domain.models.personnalisation import (
    ActionPersonnalisationRegles,
)
from business.utils.action_id import ActionId


class AbstractPersonnalisationRepository(abc.ABC):
    def __init__(self) -> None:
        pass

    @abc.abstractmethod
    def get_personnalisation_regles(
        self,
    ) -> List[ActionPersonnalisationRegles]:
        raise NotImplementedError

    @abc.abstractmethod
    def get_reponses_for_collectivite(self, collectivite_id: int) -> List[Reponse]:
        raise NotImplementedError

    @abc.abstractmethod
    def save_action_personnalisation_consequences_for_collectivite(
        self,
        collectivite_id: int,
        action_personnalisation_consequences: Dict[
            ActionId, ActionPersonnalisationConsequence
        ],
    ) -> None:
        raise NotImplementedError

    @abc.abstractmethod
    def get_unprocessed_reponse_events() -> List[ReponseUpdatedForCollectivite]:
        raise NotImplementedError


class InMemoryPersonnalisationRepository(AbstractPersonnalisationRepository):
    def __init__(self) -> None:
        self._reponses: List[Reponse] = []
        self._personnalisation_consequences_by_action_id: Dict[
            ActionId, ActionPersonnalisationConsequence
        ] = {}
        self._action_personnalisation_regles: List[ActionPersonnalisationRegles] = []
        self._unprocessed_reponse_events: List[ReponseUpdatedForCollectivite] = []

    def get_reponses_for_collectivite(self, collectivite_id: int) -> List[Reponse]:
        return self._reponses

    def save_action_personnalisation_consequences_for_collectivite(
        self,
        collectivite_id: int,
        action_personnalisation_consequences: Dict[
            ActionId, ActionPersonnalisationConsequence
        ],
    ) -> None:
        self._action_personnalisation_consequences = (
            action_personnalisation_consequences
        )

    def get_personnalisation_regles(
        self,
    ) -> List[ActionPersonnalisationRegles]:
        return self._action_personnalisation_regles

    def get_unprocessed_reponse_events(self) -> List[ReponseUpdatedForCollectivite]:
        return self._unprocessed_reponse_events

    # for test purposes only
    def set_action_personnalisation_regles(
        self,
        action_personnalisation_regles: List[ActionPersonnalisationRegles],
    ) -> None:
        self._action_personnalisation_regles = action_personnalisation_regles

    def set_reponses(self, reponses: List[Reponse]) -> None:
        self._reponses = reponses

    def set_personnalisation_consequence_by_action_id(
        self,
        personnalisation_consequences_by_action_id: Dict[
            ActionId, ActionPersonnalisationConsequence
        ],
    ) -> None:
        self._personnalisation_consequences_by_action_id = (
            personnalisation_consequences_by_action_id
        )

    def set_unprocessed_reponse_events(
        self, unprocessed_reponse_events: List[ReponseUpdatedForCollectivite]
    ) -> None:
        self._unprocessed_reponse_events = unprocessed_reponse_events
