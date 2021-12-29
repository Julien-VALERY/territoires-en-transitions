import {makeAutoObservable, reaction} from 'mobx';
import {ScoreRead} from '../../generated/dataLayer/client_scores_read';
import {ScoreController, ScoreSocket} from 'core-logic/api/sockets/ScoreSocket';
import {SupabaseScoreController} from 'core-logic/api/sockets/SupabaseScoreController';
import {supabaseClient} from 'core-logic/api/supabase';
import {clientScoresReadEndpoint} from 'core-logic/api/endpoints/ClientScoresReadEndpoint';
import {currentCollectiviteBloc} from 'core-logic/observables';
import {checkIfStateModificationsAreAllowed} from 'mobx/dist/internal';

export type CurrentCollectiviteObserved = {
  nom: string;
  collectivite_id: number;
};

// Should observe "CollectiviteId" of collectiviteBloc and ActionStatutWriteEndpoint
// so that you start the connection on first status written
export class ScoreBloc {
  private _scores: {eci: ScoreRead[]; cae: ScoreRead[]} = {eci: [], cae: []};
  private _scoreController: ScoreController | null = null;

  constructor() {
    makeAutoObservable(this);
    if (currentCollectiviteBloc.collectiviteId !== null) {
      this.fetchScoresForCollectivite(currentCollectiviteBloc.collectiviteId);
      this.openScoreSocketAndListenScoreController(
        currentCollectiviteBloc.collectiviteId
      );
    }

    // listen to currentCollectiviteBloc changes
    reaction(
      () => currentCollectiviteBloc.collectiviteId,
      collectiviteId => {
        console.log('bloc reaction collectiviteId , ', collectiviteId);
        if (collectiviteId !== null) {
          this.fetchScoresForCollectivite(collectiviteId);
          this.openScoreSocketAndListenScoreController(collectiviteId);
        }
      }
    );
  }

  private fetchScoresForCollectivite(
    // ForReferentiel
    collectiviteId: number
    // referentiel: 'cae' | 'eci'
  ) {
    clientScoresReadEndpoint
      .getBy({
        collectiviteId,
        // referentiel,
      })
      .then(clientScoresRead => {
        console.log('length of clientScoresRead : ', clientScoresRead.length);
        if (clientScoresRead) {
          this._scores.eci =
            clientScoresRead.find(
              scoresRead => scoresRead.referentiel === 'eci'
            )?.scores ?? [];
          this._scores.cae =
            clientScoresRead.find(
              scoresRead => scoresRead.referentiel === 'cae'
            )?.scores ?? [];
        }
      });
  }

  openScoreSocketAndListenScoreController(collectiviteId: number) {
    if (this._scoreController !== null) this._scoreController.dispose();

    this._scoreController = new SupabaseScoreController({
      supabaseClient,
    });
    const socket = new ScoreSocket({
      controller: this._scoreController,
      collectiviteId,
    });
    this._scoreController.listen();
    socket.scoreObservable.subscribe(observedScores => {
      if (currentCollectiviteBloc.collectiviteId)
        this.fetchScoresForCollectivite(currentCollectiviteBloc.collectiviteId);

      // TODO : use observedScores, this is just a temporary hack.

      // const eciScores = observedScores.filter(
      //   score => score.referentiel === 'eci'
      // );
      // if (eciScores.length) this._scores.eci = eciScores;
      // const caeScores = observedScores.filter(
      //   score => score.referentiel === 'eci'
      // );
      // if (caeScores.length) {
      //   console.log('received cae new scores ', caeScores.length);
      //   this._scores.cae = caeScores;
      //   console.log(
      //     'cae_1.1.1.3.3: ',
      //     caeScores.find(score => score.action_id === 'cae_1.1.1.3.3')
      //   );
      // }
    });
  }

  getScore(action_id: string, referentiel: 'eci' | 'cae') {
    const score = this._scores[referentiel].find(
      score => score.action_id === action_id
    );
    return score ? {...score} : null;
  }
}

export const scoreBloc = new ScoreBloc();
