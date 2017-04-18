import { Future, Futureall } from './prelude';
import { F2P, P2F, futurize, sideEffect } from './utils';


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
    return P2F(Promise.resolve(null)).fork(x => x, x => x);
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
    return futurize(Promise.resolve.bind(Promise))(null).fork(x => x, x => x);
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
