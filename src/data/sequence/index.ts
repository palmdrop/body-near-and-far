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
    const linkEntries = [...sequenceLinks.entries()];

    linkEntries.forEach(([link, links]) => {
      const allLinksFromSameSequence = links
        .every(({ sequence }) => sequence === links[0].sequence)

      if(allLinksFromSameSequence) {
        sequenceLinks.delete(link)
      }
    });
  }

  return sequenceLinks;
};

export const sequenceLinks = createSequenceLinks(sequences, true);