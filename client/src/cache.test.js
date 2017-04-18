import { cacheWrap, fileCache, memoryCache } from './cache';
import fs from 'fs';

const testCache = cacheMaker => {
  it('should not have a key not given yet', () => {
      expect(cacheMaker().has('key')).toBe(false);
    }
  );

  it('should return the value given', () => {
    const cache = cacheMaker(),
          key = 'hello',
          value = 'world';

    cache.set(key, value);
    expect(cache.get(key)).toBe(value);
  });
};

const fileCacheMaker = () => fileCache(fs.mkdtempSync('/tmp/fileCacheTests'));

describe('memoryCache', () => testCache(memoryCache));
describe('fileCache', () => testCache(fileCacheMaker));

const mutatingFunctionMaker = () => {
  let firstTime = true;
  return input => {
    const result = firstTime;
    firstTime = false;
    return result;
  };
};

describe('cacheWrap', () => {
  it('should call the function only once', () => {
    const mutating = mutatingFunctionMaker(),
          cache = memoryCache(),
          key = 'test',
          wrapped = cacheWrap(cache, mutating);

    expect(wrapped()).toBe(true);
    expect(wrapped()).toBe(true);
  });
});
