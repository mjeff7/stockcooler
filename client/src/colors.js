import { zip } from './prelude';


const dispersedSequence_ = n => {
  if(n === 1) return [0];

  const mid = Math.floor(n / 2),
        baseSeq = dispersedSequence_(mid),
        midSeq = dispersedSequence_(n - mid).map(i => i + mid);

  const concat = [].concat(
    ...zip(baseSeq, midSeq),
    // zip will leave off the last element of midSeq if they are not
    // the same length.
    baseSeq.length === midSeq.length ? [] : [midSeq[midSeq.length - 1]]
  );

  return concat;
};

const dispersedSequence = n => {
  if(n < 1)
    throw `Nothing to disperse! n = ${n}`;

  return dispersedSequence_(n);
};

// Like dispersedSequence but works in powers of 2 only.
// dispersedSequenceDepth(d) === dispersedSequence(2^n),
// at least it should.
const dispersedSequenceDepth = d => {
  if(d < 1) return [];

  let acc = [0],
      step = 1;

  for(; d > 0; d--) {
    acc = [].concat(...acc.map(i => [i, i+step]));
    step *= 2;
  }

  return acc;
}

const seq360 = dispersedSequence(360),
      // Clip the 100 sequence to 25 to 75 and start in the middle.
      seq100 = dispersedSequence(50).map(i => (i+25) % 50 + 25);


export const pickNewColor = alreadyUsed => {
  let newColor;

  for(let l of seq100)
    for(let h of seq360) {
      newColor = `hsl(${h}, 50%, ${l}%)`;
      if(!alreadyUsed.includes(newColor))
        return newColor;
    }

  return "That's a lot of colors you're asking for.";
};
