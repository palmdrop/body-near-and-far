import { createMemo, createSignal, onMount } from "solid-js";
import { Link, SequenceLineVisits, SequenceLinks } from "~/types/links"
import { Sequence } from "~/types/sequence"
import { randomElement } from "~/utils/array";
import { getLine, getLineEntry, getMaxIndex } from "~/utils/sequence";

type Options = {
  linkProbability: number,
  startIndices?: number[],
  allowSelfLinks?: boolean,
}

// NOTE: avoid following links to lines that have been used recently
// NOTE: and then add a cooldown to avoid the same sequence being moved too often? or skip that?

const getAvailableLinks = (
  sequenceLinks: Link[],
  visitedSequences: number[],
  visitedLines: SequenceLineVisits
) => {
  const availableLinks = sequenceLinks
    .filter(({ sequence }) => !visitedSequences.includes(sequence));

  if(!availableLinks.length) return availableLinks;

  // TODO
  const prioritizedLinks = availableLinks;
  return prioritizedLinks;
}

const followLink = (
  sequences: Sequence[], 
  links: SequenceLinks, 
  sequenceIndex: number, 
  lineIndex: number,
  visitedSequences: number[],
  visitedLines: SequenceLineVisits
) => {
  const sequence = sequences[sequenceIndex];
  const lineEntry = getLineEntry(sequence, lineIndex);
  const lineLinks = lineEntry?.links;

  if(!lineLinks) return undefined;

  const linkKey = randomElement(lineLinks);
  const sequenceLinks = links.get(linkKey);

  if(!sequenceLinks) return undefined;

  const availableLinks = getAvailableLinks(
    sequenceLinks,
    visitedSequences,
    visitedLines
  )
  
  if(!availableLinks.length) return undefined;

  const link = randomElement(availableLinks);

  visitedLines.set(`${link.sequence}.${link.line}`, new Date());

  return {
    ...link,
    linkKey
  }
}

// NOTE: make it an actual iterator, letting the interval be controlled from consumer?
export const createLinkedIterator = (
  sequences: Sequence[],
  links: SequenceLinks,
  options: Options = {
    linkProbability: 0.25,
    startIndices: sequences.map(() => 0),
    allowSelfLinks: false
  }
) => {
  const { startIndices } = options;

  const SEQUENCE_INDICES = sequences.map((_, i) => i);
  const SEQUENCE_MAX_INDEX = sequences.map(sequence => getMaxIndex(sequence));
  const lineIndices = sequences.map(
    () => createSignal(0)
  );

  const visitedLines: SequenceLineVisits = new Map();

  onMount(() => {
    lineIndices.forEach(
      ([, setLineIndex], i) => setLineIndex(startIndices?.[i] ?? 0)
    );
  });

  const incrementLineIndex = (sequenceIndex: number) => {
    const [, setLineIndex] = lineIndices[sequenceIndex];
    setLineIndex(i => (i + 1) % SEQUENCE_MAX_INDEX[sequenceIndex]);
  }

  const update = () => {
    const shouldFollowLinks = Math.random() < options.linkProbability;

    if(!shouldFollowLinks) {
      SEQUENCE_INDICES.forEach(incrementLineIndex);
      return;
    }

    const visitedSequences: number[] = [];
    let availableSequences = [...SEQUENCE_INDICES];

    let link: ReturnType<typeof followLink> = undefined;
    while(visitedSequences.length !== sequences.length) {
      const sequenceIndex = !!link
        ? link.sequence 
        : randomElement(availableSequences);

      visitedSequences.push(sequenceIndex);
      availableSequences = availableSequences.filter(i => i !== sequenceIndex);

      if(!link) {
        incrementLineIndex(sequenceIndex);
      } else {
        const [_, setLineIndex] = lineIndices[sequenceIndex];
        setLineIndex(link.line);
      }

      const [lineIndex] = lineIndices[sequenceIndex];
      link = followLink(
        sequences,
        links,
        sequenceIndex,
        lineIndex(),
        visitedSequences,
        visitedLines
      );
    }
  }

  const lines = createMemo(
    () => lineIndices.map(([lineIndex], i) => getLine(sequences[i], lineIndex()) ?? "")
  );

  return {
    update,
    lineIndices: lineIndices.map(([i]) => i),
    lines,
  }
}