import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { Sequence } from "~/types/sequence";

export const getLineEntry = (sequence: Sequence, index: number) => {
  const section = sequence.find(
    (section, i) => {
      if(i === sequence.length - 1) return section;
      const nextSection = sequence[i + 1];
      return section.lines[0].index <= index && nextSection.lines[0].index > index;
    }
  );

  if(!section) return undefined;

  const lineEntry = section.lines.find(lineEntry => lineEntry.index === index);
  return lineEntry;
}

export const getLine = (sequence: Sequence, index: number) => {
  const lineEntry = getLineEntry(sequence, index);
  return lineEntry?.content;
}

export const getMaxIndex = (sequence: Sequence) => {
  return sequence.at(-1)?.lines.findLast(line => line.index > 0)?.index ?? 0;
}

export const sequenceChangeCallback = (element: HTMLLIElement, root: HTMLUListElement) => {
  const elementRect = element.getBoundingClientRect();
  const rootRect = root.getBoundingClientRect();

  const deltaTop = elementRect.top - rootRect.top;
  const deltaBottom = elementRect.bottom - rootRect.bottom;

  const padding = rootRect.height * (Math.random() * 0.2 + 0.05);

  if(deltaTop < 0) {
    root.scrollBy({
      top: deltaTop - padding,
      behavior: "smooth"
    });
  } else if(deltaBottom > 0) {
    root.scrollBy({
      top: deltaBottom + padding,
      behavior: "smooth"
    });
  }
}

export const createSequenceIterator = (sequence: Sequence, interval: number, startIndex = 0) => {
  const [index, setIndex] = createSignal(0);

  onMount(() => {
    setIndex(startIndex);
  });

  const lastIndex = sequence.at(-1)
    ?.lines
    .findLast(line => line.content.length)
    ?.index ?? 0;

  let intervalHandle: NodeJS.Timeout;

  const stopInterval = () => {
    if(!intervalHandle) return;
    clearInterval(intervalHandle)
  }

  onCleanup(stopInterval);

  const startInterval = () => {
    stopInterval();

    intervalHandle = setInterval(() => {
      setIndex(i => (i + 1) % lastIndex);
    }, interval);
  }

  startInterval();

  const line = createMemo(() => {
    return getLine(sequence, index()) || "";
  });


  return { 
    index, 
    line,
    setIndex: (index: number) => {
      startInterval();
      setIndex(index % lastIndex);
    }, 
  }

}  