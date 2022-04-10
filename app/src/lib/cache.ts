export class ExpiringCache<K, T> {
  private map: Map<K, CacheEntry<T>> = new Map();
  private defaultExpiration: number;

  public constructor(defaultExpiration = 60 * 1000) {
    this.defaultExpiration = defaultExpiration;
  }

  public has(k: K) {
    let d = this.map.get(k);
    if (d == null) return false;
    if (d.expiration < Date.now()) return false;
    return true;
  }

  public get(k: K) {
    let d = this.map.get(k);
    if (d == null) return null;
    if (d.expiration < Date.now()) return null;

    return d.data;
  }

  public delete(k: K) {
    let d = this.map.delete(k);
    return d;
  }

  public set(k: K, d: T, ttl?: number) {
    if (ttl == null) ttl = this.defaultExpiration;

    this.map.set(k, {
      data: d,
      expiration: Date.now() + ttl,
    });
  }
}

type CacheEntry<T> = {
  data: T;
  expiration: number;
};
