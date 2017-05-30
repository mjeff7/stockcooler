import { Future } from './prelude';
import {
  F2P, P2F, futurize,
  Futureall, futureFold, sideEffect
} from './utils';


describe('sideEffects', () => {
  it('should run the side effect', () => {
    let changed = false;

    sideEffect(() => changed = true)();
    expect(changed).toBe(true);
  });
  it('should not change the value given it', () => {
    const VALUE = 4;
    expect(sideEffect(() => null)(VALUE)).toBe(VALUE);
  });
});

describe('F2P', () => {
  const PAYLOAD = 'secret payload';

  it('should return a promise', () => {
    return F2P(Future.of()).then().catch();
  });
  it('should resolve to a promise resolve', () => {
    return F2P(Future.of(PAYLOAD))
      .then(x => x, () => 'rejected')
      .then(r => expect(r).toBe(PAYLOAD));
  });
  it('should reject to a promise reject', () => {
    return F2P(Future.reject(PAYLOAD))
      .then(() => 'resolved', x => x)
      .then(r => expect(r).toBe(PAYLOAD));
  });
});

describe('P2F', () => {
  const PAYLOAD = 'secret payload';

  it('should return a future', () => {
    P2F(Promise.resolve(null)).fork(x => x, x => x);
  });
  it('should resolve to a future resolve', () => {
    return F2P(P2F(Promise.resolve(PAYLOAD)))
      .then(x => x, () => 'rejected')
      .then(r => expect(r).toBe(PAYLOAD));
  });
  it('should reject to a promise reject', () => {
    return F2P(P2F(Promise.reject(PAYLOAD)))
      .then(() => 'resolved', x => x)
      .then(r => expect(r).toBe(PAYLOAD));
  });
  it('should not run unless forked', () => {
    return F2P(P2F(Promise.reject(PAYLOAD)))
      .then(() => 'resolved', x => x)
      .then(r => expect(r).toBe(PAYLOAD));
  });
});

describe('futurize', () => {
  const PAYLOAD = 'secret payload';

  it('should return a function returning a future', () => {
    futurize(Promise.resolve.bind(Promise))(null).fork(x => x, x => x);
  });
  it('should resolve to a future resolve', () => {
    return F2P(futurize(Promise.resolve.bind(Promise))(PAYLOAD))
      .then(x => x, () => 'rejected')
      .then(r => expect(r).toBe(PAYLOAD));
  });
  it('should reject to a promise reject', () => {
    return F2P(futurize(Promise.reject.bind(Promise))(PAYLOAD))
      .then(() => 'resolved', x => x)
      .then(r => expect(r).toBe(PAYLOAD));
  });
  it('should not run unless forked', () => {
    expect.assertions(1);
    const a = shouldRun => new Promise((res, rej) => {
      expect(shouldRun).toBe(true);
      res(true);
    });
    const b = futurize(a);
    b(true).fork(x=>x, x=>x);
    b(false);
  });
});

describe('Futureall', () => {
  it('should resolve to array of Future resolutions', () => {
    const PAYLOAD = [1,2,3];
    return F2P(
      Futureall( PAYLOAD.map(i => Future.of(i)) )
    )
    .then(r => expect(r).toEqual(PAYLOAD));
  });
  it('should reject when any single future rejects', () => {
    const PAYLOAD = [1,2,3];
    return F2P(
      Futureall( PAYLOAD.map(i => i === 2 ? Future.reject(i) : Future.of(i)) )
    )
    .then(r => 'resolved', r => 'rejected')
    .then(r => expect(r).toBe('rejected'));
  });
  it('should not run unless forked', () => {
    expect.assertions(1);
    const b = shouldRun => Future((rej, res) => {
      expect(shouldRun).toBe(true);
      res(true);
    });
    Futureall([b(true)]).fork(x=>x, x=>x);
    Futureall([b(false)]);
  });
});

describe('futureFold', () => {
  it('should resolve to final accumulator', () => {
    const PAYLOAD = [1,2,3];
    return F2P(
      futureFold((sum, i, v) => sum+1, 0, PAYLOAD.map(i => Future.of(i)) )
    )
    .then(r => expect(r).toEqual(PAYLOAD.length));
  });
  it('should reject when any single future rejects', () => {
    const PAYLOAD = [1,2,3];
    return F2P(
      futureFold(
        () => null, null,
        PAYLOAD.map(i => i === 2 ? Future.reject(i) : Future.of(i))
      )
    )
    .then(r => 'resolved', r => 'rejected')
    .then(r => expect(r).toBe('rejected'));
  });
  it('should not run unless forked', () => {
    expect.assertions(1);
    const b = shouldRun => Future((rej, res) => {
      expect(shouldRun).toBe(true);
      res(true);
    });
    futureFold(() => null, null, [b(true)]).fork(x=>x, x=>x);
    futureFold(() => null, null, [b(false)]);
  });
  it('should invoke accumulator in order of resolution', () => {
    const unordered = [3, 1, 2];
    const resolvers = [];
    // The following futures will resolve to values in increasing order.
    const futures = unordered.slice().sort().map(i =>
      Future((rej, res) => resolvers[i] = () => res(i))
    );
    const foldedFuture = F2P(
      futureFold(
        (a, i, v) => a.concat([v]), [],
        futures
      )
    )
    .catch(error => { throw {msg: "Test got an error", error}; })
    .then(result => expect(result).toEqual(unordered));

    // Resolve the futures in non-ascending order to ensure they are handled
    // that way.
    unordered.forEach(i => resolvers[i]());

    return foldedFuture;
  });
});
