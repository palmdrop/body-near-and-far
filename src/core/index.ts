import { createSignal } from "solid-js";
import { SequenceLinks } from "~/types/links"
import { Sequence } from "~/types/sequence"
import { randomElement } from "~/utils/array";
import { getLine, getLineEntry, getMaxIndex } from "~/utils/sequence";

type Options = {
  linkProbability: number,
  interval: number,
  startIndices?: number[],
  allowSelfLinks?: boolean,
}

// NOTE: maybe just work with probabilities... i.e follow a link with a random probability
// NOTE: and then add a cooldown to avoid the same sequence being moved too often? or skip that?

const followLink = (
  sequences: Sequence[], 
  links: SequenceLinks, 
  sequenceIndex: number, 
  lineIndex: number,
  visitedSequences: number[],
) => {
  const sequence = sequences[sequenceIndex];
  const lineEntry = getLineEntry(sequence, lineIndex);
  const lineLinks = lineEntry?.links;

  if(!lineLinks) return undefined;

  const linkKey = randomElement(lineLinks);
  const sequenceLinks = links.get(linkKey);

  if(!sequenceLinks) return undefined;

  const availableLinks = sequenceLinks
    .filter(({ sequence }) => !visitedSequences.includes(sequence));

  if(!availableLinks.length) return undefined;

  const link = randomElement(availableLinks);

  return {
    ...link,
    linkKey
  }
}

// NOTE: make it an actual iterator, letting the interval be controlled from consumer?
const createLinkedIterator = (
  sequences: Sequence[],
  links: SequenceLinks,
  options: Options = {
    interval: 1000,
    linkProbability: 0.25,
    startIndices: sequences.map(() => 0),
    allowSelfLinks: false
  }
) => {
  const { interval, startIndices } = options;

  const SEQUENCE_INDICES = sequences.map((_, i) => i);
  const SEQUENCE_MAX_INDEX = sequences.map(sequence => getMaxIndex(sequence));
  const sequenceLineIndices = sequences.map(
    () => createSignal(0)
  );

  // 1. Pick starting sequence
  // 2. Add starting sequence to list of visited sequences
  // 3. Possibly follow link. Move linked sequence to link location.
  // 4. Push linked sequence to visited sequences
  // 5. Repeat

  const incrementLineIndex = (sequenceIndex: number) => {
    const [, setLineIndex] = sequenceLineIndices[sequenceIndex];
    setLineIndex(i => (i + 1) % SEQUENCE_MAX_INDEX[sequenceIndex]);
  }

  const updateSequences = () => {
    const shouldFollowLinks = Math.random() < options.linkProbability;

    if(!shouldFollowLinks) {
      SEQUENCE_INDICES.forEach(incrementLineIndex);
      return;
    }

    const visitedSequences: number[] = [];
    let availableSequences = [...SEQUENCE_INDICES];

    // let nextSequence: number | undefined = undefined;
    let link: { sequence: number, line: number, linkKey: string } | undefined = undefined;
    while(visitedSequences.length !== sequences.length) {
      // TODO: need to actually increment line index of the sequence UNLESS it followed a 
      const sequenceIndex = !!link
        ? link.sequence 
        : randomElement(availableSequences);

      visitedSequences.push(sequenceIndex);
      availableSequences = availableSequences.filter(i => i !== sequenceIndex);

      const lineIndex = sequenceLineIndices[sequenceIndex][0]();
      const nextLink = followLink(
        sequences,
        links,
        sequenceIndex,
        lineIndex,
        visitedSequences
      );



      link = nextLink;
    }
  }
}