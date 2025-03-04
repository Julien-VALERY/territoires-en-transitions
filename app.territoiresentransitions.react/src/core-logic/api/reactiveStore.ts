import {isStorable, Storable} from './storable';

import {APIEndpoint} from './apiEndpoint';
import {ChangeNotifier} from 'core-logic/api/reactivity';

export const defaultAuthorization = () => `Bearer `;

/**
 * A subscribable store with an external cache.
 *
 * todo: remove Bad idea not used
 */
export class ReactiveStore<T extends Storable, S> extends ChangeNotifier {
  constructor({
    host,
    endpoint,
    serializer,
    deserializer,
    authorization = () => '',
    stateAccessor,
  }: {
    host: string;
    endpoint: () => string;
    serializer: (storable: T) => object;
    deserializer: (serialized: object) => T;
    authorization?: () => string;
    stateAccessor: (state: S) => Map<string, T>;
  }) {
    super();
    this.host = host;
    this.pathname = endpoint;
    this.serializer = serializer;
    this.deserializer = deserializer;
    this.stateAccessor = stateAccessor;

    this.api = new APIEndpoint<T>({
      host: this.host,
      endpoint: this.pathname,
      serializer: this.serializer,
      deserializer: this.deserializer,
      authorization: authorization,
    });
  }

  host: string;
  pathname: () => string;
  serializer: (storable: T) => object;
  deserializer: (serialized: object) => T;
  api: APIEndpoint<T>;
  stateAccessor: (state: S) => Map<string, T>;
  private fetchedPaths: string[] = [];

  // local: LocalStore<T>;

  /**
   * Store a Storable at pathname/id.
   *
   * @param state the overmind state
   * @param storable the object to save
   */
  async store({state}: {state: S}, storable: T): Promise<T> {
    if (!isStorable(storable)) {
      throw new Error(`${typeof storable} is not storable.`);
    }

    const stored = await this.api.store(storable);
    return this.writeInCache(state, stored);
  }

  /**
   * Return all storable of type T existing at pathname.
   * If nothing is found returns an empty record.
   *
   * @param state the overmind state
   */
  async retrieveAll({state}: {state: S}): Promise<Array<T>> {
    const cache = await this.getCache(state);
    return [...cache.values()];
  }

  /**
   * Return a storable with matching id.
   * Throw if no storable is found or path does not exist.
   *
   * @param state the overmind state
   * @param id Storable id
   */
  async retrieveById({state}: {state: S}, id: string): Promise<T | null> {
    return this.retrieveByPath({state}, id);
  }

  /**
   * Return a storable with matching path.
   * Throw if no storable is found or path does not exist.
   *
   * @param state
   * @param path Storable path
   */
  async retrieveByPath({state}: {state: S}, path: string): Promise<T | null> {
    const cache = await this.getCache(state);
    for (const key of cache.keys()) {
      if (key.startsWith(path)) return cache.get(key)!;
    }
    return null;
  }

  /**
   * Return all storable of type T existing at path under pathname.
   * If nothing is found returns an empty list.
   */
  async retrieveAtPath({state}: {state: S}, path: string): Promise<Array<T>> {
    const cache = await this.getCache(state);
    const results = [];

    for (const key of cache.keys()) {
      if (key.startsWith(path)) results.push(cache.get(key)!);
    }

    return [...results];
  }

  /**
   * Delete a Storable stored at pathname/id.
   * Return true if something was deleted, false if nothing exists at pathname/id.
   *
   * @param state overmind state
   * @param id Storable id
   */
  async deleteById({state}: {state: S}, id: string): Promise<boolean> {
    const deleted = await this.api.deleteById(this.stripId(id));
    await this.removeFromCache(state, id, true);
    return deleted;
  }

  /**
   * Strip id removes redundant parts shared by the id and the endpoint.
   *
   * Ex: if the endpoint path is `v1/endpoint/epci_id/`
   * and the id is `epci_id/part_a/part_b`
   * the resulting stripped id would be `part_a/part_b`,
   * a path removed from the redundant part `epci_id`
   */
  private stripId(id: string): string {
    const endpoint = this.pathname().split('/');
    let path = id.split('/');
    let match = false;

    for (let i = 0; i < endpoint.length; i++) {
      const part = endpoint[i];
      if (part === path[0]) {
        match = true;
        path = path.slice(1);
      } else if (match) {
        break;
      }
    }

    return path.join('/');
  }

  private async writeInCache(state: S, storable: T): Promise<T> {
    await this.removeFromCache(state, storable.id, false);
    this.stateAccessor(state).set(storable.id, storable);
    this.notifyListeners();
    return storable;
  }

  private async removeFromCache(
    state: S,
    id: string,
    notify: boolean
  ): Promise<boolean> {
    const deleted = this.stateAccessor(state).delete(id);
    if (notify) this.notifyListeners();
    return deleted;
  }

  private async getCache(state: S): Promise<Map<string, T>> {
    const pathname = this.pathname();

    if (this.fetchedPaths.includes(pathname)) {
      return this.stateAccessor(state);
    }

    if (!this.retrieving[pathname]) {
      const promise = this.api.retrieveAll().then(all => {
        const cache = new Map<string, T>();
        for (const storable of all) {
          cache.set(storable.id, storable);
        }
        return cache;
      });

      promise.then(retrieved => {
        const cache = this.stateAccessor(state);
        // cache.clear();
        for (const [key, value] of retrieved.entries()) {
          cache.set(key, value);
        }
        this.notifyListeners();
        this.fetchedPaths.push(pathname);
      });

      this.retrieving[pathname] = promise;
    }

    return this.retrieving[pathname];
  }

  private retrieving: Record<string, Promise<Map<string, T>>> = {};
}
