// @flow

import { Future, once } from './prelude';

export const sideEffect =
  <A>(f: A => mixed) : (A => A) =>
     (d: A) =>
     { f(d); return d; };
export const P2F =
  (p: Promise<*>) : Future =>
  Future((rej, res) => {
    p.then(res, rej)
    .catch(e => console.error("Uncaught here: ", e));
  });
export const F2P =
  (f: Future) : Promise<*> =>
  new Promise((res, rej) => f.fork(rej, res));
export const futurize =
  (fp: (mixed => Promise<*>)) =>
  (...args: Array<*>) => Future((rej, res) => {
    fp(...args).then(res, rej);
  });

export const Futureall = (fs: Array<Future>) : Future => {
  let futuresRemaining = fs.length;
  if(futuresRemaining === 0)
    return Future.of([]);

  let results = fs.map(() => undefined);

  return Future((rej, res) => {
    const childReject = once(rej);
    const childResolve = i => result => {
      results[i] = result;
      futuresRemaining--;

      if(futuresRemaining === 0)
        res(results);
    };

    fs.forEach((f, i) => f.fork(childReject, childResolve(i)))
  });
};

export const Futurefold =
(
  accF: (any, number, any) => any,
  initial: any,
  fs: Array<Future>
): Future => {
  let futuresRemaining = fs.length;
  if(futuresRemaining === 0)
    return Future.of([]);

  let acc = initial;
  let results = fs.map(() => undefined);

  return Future((rej, res) => {
    const childReject = once(rej);
    const childResolve = i => result => {
      results[i] = result;
      futuresRemaining--;

      acc = accF(acc, i, result);

      if(futuresRemaining === 0)
        res(acc);
    };

    fs.forEach((f, i) => f.fork(childReject, childResolve(i)))
  });
};
