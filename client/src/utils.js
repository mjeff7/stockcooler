import { compose, Future, map } from './prelude';

export const sideEffect = f => d => { f(d); return d; };
export const P2F = p => Future((rej, res) => p.then(res, rej));
export const F2P = f => new Promise((res, rej) => f.fork(rej, res));
export const futurize = fp => (...args) => P2F(fp(...args))

// Poor man's Future.all
export const Futureall = fs =>
  compose(P2F, Promise.all, map(F2P));
