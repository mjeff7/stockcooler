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
    throw new Error(`Nothing to disperse! n = ${n}`);

  return dispersedSequence_(n);
};

//const seq360 = dispersedSequence(360);
      // Clip the 100 sequence to 25 to 75 and start in the middle.
const seq100 = dispersedSequence(50).map(i => (i+25) % 50 + 25);
const seqHues = dispersedSequence(6).map(i => i * 360 / 6);


export const pickNewColor = alreadyUsed => {
  let newColor;

  for(let l of seq100)
    for(let h of seqHues) {
      newColor = `hsl(${h}, 50%, ${l}%)`;
      if(!alreadyUsed.includes(newColor))
        return newColor;
    }

  return "That's a lot of colors you're asking for.";
};
