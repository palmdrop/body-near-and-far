import { createMemo, createSignal, onMount } from "solid-js";
import { FollowedLink, Link, SequenceLineVisits, SequenceLinks } from "~/types/links"
import { Sequence } from "~/types/sequence"
import { randomElement } from "~/utils/array";
import { getLine, getLineEntry, getMaxIndex } from "~/utils/sequence";

type Options = {
  linkProbability: number,
  startIndices?: number[],
  allowSelfLinks?: boolean,
}

const getAvailableLinks = (
  sequenceLinks: Link[],
  visitedSequences: number[],
  visitedLines: SequenceLineVisits
) => {
  const availableLinks = sequenceLinks
    .filter(({ sequence }) => !visitedSequences.includes(sequence));

  if(!availableLinks.length) return availableLinks;

  const unvisited = availableLinks.filter(
    ({ sequence, line }) => !visitedLines.has(`${sequence}.${line}`)
  );

  if(unvisited.length) {
    return unvisited;
  }

  availableLinks.forEach(
    ({ sequence, line }) => visitedLines.delete(`${sequence}.${line}`)
  );

  return availableLinks;
}

const followLink = (
  sequences: Sequence[], 
  links: SequenceLinks, 
  sequenceIndex: number, 
  lineIndex: number,
  visitedSequences: number[],
  visitedLines: SequenceLineVisits
): FollowedLink | undefined => {
  const sequence = sequences[sequenceIndex];
  const lineEntry = getLineEntry(sequence, lineIndex);
  const lineLinks = lineEntry?.links;

  if(!lineLinks) return undefined;

  const linksToTry = [...lineLinks];

  while(linksToTry.length) {
    const index = Math.floor(Math.random() * linksToTry.length);
    const key = linksToTry[index];

    linksToTry.splice(index, 1);

    if(!key) continue;

    const sequenceLinks = links.get(key);

    if(!sequenceLinks) continue;

    const availableLinks = getAvailableLinks(
      sequenceLinks,
      visitedSequences,
      visitedLines
    )
    
    if(!availableLinks.length) continue;

    const link = randomElement(availableLinks);

    visitedLines.add(`${link.sequence}.${link.line}`);

    return {
      ...link,
      originSequence: sequenceIndex,
      originLine: lineIndex,
      key
    }
  }

  return undefined;
}

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

  const visitedLines: SequenceLineVisits = new Set();

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

    const followedLink: FollowedLink[] = [];
    let link: FollowedLink | undefined = undefined;

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

      if(link) {
        followedLink.push(link);
      }
    }

    return followedLink
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