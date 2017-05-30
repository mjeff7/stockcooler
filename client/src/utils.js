// @flow

import { Future, once } from './prelude';


export const try_ = <A>(
  f: void => A,
  errorHandler: Error => mixed,
  defaultResult: A,
): A => {
  try {
    return f();
  } catch(error) {
    errorHandler(error);

    return defaultResult;
  }
};

export const sideEffect =
  <A>(f: A => mixed) : (A => A) =>
  (d: A) => {
    f(d);

    return d;
  };

export const P2F =
  (p: Promise<*>) : Future =>
  Future.fromPromise(() => p, null);
export const F2P = (f: Future) : Promise<*> => f.promise();
export const futurize =
  <A>(fp: (A => Promise<*>)) =>
  (...args: Array<*>) => Future((rej, res) => {
    fp(...args).then(res, rej);
  });

export const futureAll = Future.parallel(Infinity);

export const futureFold =
(
  accF: (any, number, any) => any,
  initial: any,
  fs: Array<Future>
): Future => {
  let futuresRemaining = fs.length;

  // eslint-disable-next-line no-magic-numbers
  if(futuresRemaining === 0) return Future.of([]);

  const results = fs.map(() => void '');
  let acc = initial;

  return Future((rej, res) => {
    const childReject = once(rej);
    const childResolve = i => result => {
      results[i] = result;
      // eslint-disable-next-line no-magic-numbers
      futuresRemaining -= 1;

      acc = accF(acc, i, result);

      // eslint-disable-next-line no-magic-numbers
      if(futuresRemaining === 0) res(acc);
    };

    fs.forEach((f, i) => f.fork(childReject, childResolve(i)));
  });
};
