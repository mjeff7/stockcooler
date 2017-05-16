// @flow

import { Future, once } from './prelude';


export const try_ = (f, errorHandler, defaultResult) => {
  try {
    return f();
  } catch(error) {
    errorHandler(error);
    return defaultResult;
  }
};

export const sideEffect =
  <A>(f: A => mixed) : (A => A) =>
     (d: A) =>
     { f(d); return d; };

export const P2F =
  (p: Promise<*>) : Future =>
  Future.fromPromise(() => p, null);
export const F2P = (f: Future) : Promise<*> => f.promise();
export const futurize =
  (fp: (mixed => Promise<*>)) =>
  (...args: Array<*>) => Future((rej, res) => {
    fp(...args).then(res, rej);
  });

export const Futureall = Future.parallel(Infinity);

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
