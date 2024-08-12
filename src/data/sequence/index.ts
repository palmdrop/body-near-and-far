import { earlyToLateSequence } from "./early-to-late";
import { nearToFarSequence } from "./near-to-far";
import { loopToUnloopSequence } from "./loop-to-unloop";
import { SequenceLinks } from "~/types/links";
import { Sequence } from "~/types/sequence";

export const sequences = [
  earlyToLateSequence, nearToFarSequence, loopToUnloopSequence
];

const createSequenceLinks = (sequences: Sequence[], removeSelfOnlyLinks: boolean) => {
  const sequenceLinks: SequenceLinks = new Map();

  sequences
    .forEach((sequence, sequenceIndex) => {
      sequence
        .flatMap(section => section.lines)
        .flatMap(({ links, index }) => links.map(link => [link, index]))
        .forEach(
          ([link, index]) => {
            if(!sequenceLinks.has(link as string)) {
              sequenceLinks.set(link as string, []);
            }

            sequenceLinks.get(link as string)!.push({
              sequence: sequenceIndex,
              line: index as number
            });
          }
        );
    });

  if(removeSelfOnlyLinks) {
    [...sequenceLinks.entries()].forEach(([link, links]) => {
      if(
        links.length === 1 ||
        links.every(({ sequence }) => sequence === links[0].sequence)
      ) {
        sequenceLinks.delete(link)
      }
    });
  }

  console.log(sequenceLinks)

  return sequenceLinks;
};

export const sequenceLinks: SequenceLinks = createSequenceLinks(sequences, true);