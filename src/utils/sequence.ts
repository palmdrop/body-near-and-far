import { Sequence } from "~/types/sequence";

export const getLine = (sequence: Sequence, index: number) => {
  const section = sequence.find(
    (section, i) => {
      if(i === sequence.length - 1) return section;
      const nextSection = sequence[i + 1];
      return section.lines[0].index <= index && nextSection.lines[0].index > index;
    }
  );

  if(!section) return undefined;

  const lineEntry = section.lines.find(lineEntry => lineEntry.index === index);
  return lineEntry?.content;
}

export const getMaxIndex = (sequence: Sequence) => {
  return sequence.at(-1)?.lines.findLast(line => line.index > 0)?.index ?? 0;
}