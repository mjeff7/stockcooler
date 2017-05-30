// @flow

import fs from 'fs';
import path from 'path';

export type CacheProvider<K, V> = {
  +has : K => bool,
  +get : K => V,
  +set : (K, V) => mixed
};

export const memoryCache : () => CacheProvider<*, *> = () => new Map();

export const fileCache : string => CacheProvider<string, mixed> =
  (directory : string) => {
    const pathTo = (name : string) => path.join(directory, name);

    return {
      get: name => JSON.parse(
        fs.readFileSync(pathTo(name), { encoding: 'utf8' })
      ),
      has: name => fs.existsSync(pathTo(name)),
      set: (name, data) =>
        fs.writeFileSync(pathTo(name), JSON.stringify(data)),
    };
  };

export const localStorageCache : string => CacheProvider<string, mixed> =
  (nameSpace : string = '') => {
    const pathTo = (name : string) => nameSpace + name;
    const { localStorage } = window;

    return {
      get: name => JSON.parse(localStorage.getItem(pathTo(name))),
      has: name => localStorage.getItem(pathTo(name)) !== null,
      set: (name, data) =>
        localStorage.setItem(pathTo(name), JSON.stringify(data)),
    };
  };

export const cacheWrap = <A, B>(
  cache : CacheProvider<A, B>,
  f : A => B
) : (A => B) => x => {
  if(!cache.has(x)) {
    const result = f(x);

    cache.set(x, result);
  }

  return cache.get(x);
};
