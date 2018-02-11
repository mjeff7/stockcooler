/* eslint no-magic-numbers: off */
import { zip } from './prelude';


const dispersedSequence_ = n => {
  if(n === 1) return [0];

  const mid = Math.floor(n / 2);
  const baseSeq = dispersedSequence_(mid);
  const midSeq = dispersedSequence_(n - mid).map(i => i + mid);

  const concat = [].concat(
    ...zip(baseSeq, midSeq),
    // Util zip will leave off the last element of midSeq if they are not
    // the same length.
    baseSeq.length === midSeq.length ? [] : [midSeq[midSeq.length - 1]]
  );

  return concat;
};

const dispersedSequence = n => {
  if(n < 1) throw new Error(`Nothing to disperse! n = ${n}`);

  return dispersedSequence_(n);
};

// Clip the 100 sequence to 25 to 75 and start in the middle.
const seq100 = dispersedSequence(50).map(i => (i + 25) % 50 + 25);
const seqHues = dispersedSequence(6).map(i => i * 360 / 6);


export const pickNewColor = alreadyUsed => {
  for(const l of seq100) {
    for(const h of seqHues) {
      const newColor = `hsl(${h}, 50%, ${l}%)`;

      if(!alreadyUsed.includes(newColor)) return newColor;
    }
  }

  return 'That\'s a lot of colors you\'re asking for.';
};
