import { Title } from "@solidjs/meta";
import { createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import { Filter } from "~/assets/MorphFilter";
import { Composite } from "~/components/composite/Composite";
import { SequenceRenderer } from "~/components/sequence/SequenceRenderer";
import { bodyField } from "~/data/field/body";
import { earlyToLateSequence } from "~/data/sequence/early-to-late";
import { loopToUnloopSequence } from "~/data/sequence/loop-to-unloop";
import { nearToFarSequence } from "~/data/sequence/near-to-far";
import { Sequence } from "~/types/sequence";
import { createFieldIterator } from "~/utils/field";
import { getLine } from "~/utils/sequence";
import { indicesToUrlHash, parseIndicesFromString } from "~/utils/url";

const createLineInterval = (sequence: Sequence, interval: number) => {
  const [index, setIndex] = createSignal(0);

  const lastIndex = sequence.at(-1)
    ?.lines
    .findLast(line => line.content.length)
    ?.index ?? 0;

  const intervalHandle = setInterval(() => {
    setIndex(i => (i + 1) % lastIndex);
  }, interval);

  const line = createMemo(() => {
    return getLine(sequence, index()) || "";
  });

  onCleanup(() => clearInterval(intervalHandle));

  return { index, line }
}

// TODO: make slower
const sequenceSpeed = 2000;
const fieldSpeed = 1000;

export default function Root() {
  const { index: earlyToLateIndex, line: earlyToLateLine } = createLineInterval(earlyToLateSequence, sequenceSpeed);
  const { index: nearToFarIndex, line: nearToFarLine } = createLineInterval(nearToFarSequence, sequenceSpeed);
  const { index: loopToUnloopIndex, line: loopToUnloopLine } = createLineInterval(loopToUnloopSequence, sequenceSpeed);

  const { 
    word: fieldWord, 
    inSubField, 
    index: fieldIndex 
  } = createFieldIterator(bodyField, 0, fieldSpeed, fieldSpeed / 2);

  const fieldLine = createMemo(
    () => inSubField() ? 
      `[ ${fieldWord()} ]` 
      : fieldWord()
  );

  const index = createMemo(
    () => `${earlyToLateIndex()}.${nearToFarIndex()}.${loopToUnloopIndex()} (${fieldIndex()})`
  );

  const sequenceChangeCallback = (element: HTMLLIElement, root: HTMLUListElement) => {
    root.scrollTo({
      left: 0,
      top: Math.max(0, element.offsetTop - root.clientHeight / 2),
      behavior: "smooth"
    });
  }

  createEffect(() => {
    const hash = indicesToUrlHash(earlyToLateIndex(), nearToFarIndex(), loopToUnloopIndex(), fieldIndex());
    window.location.hash = hash;
  });

  return (
    <main>
      <Title>{`${fieldWord()?.toUpperCase()} | Nära och långt från kroppen`}</Title> 
      <Filter />
      <div class="center-piece">
        <Composite 
          lines={[earlyToLateLine(), nearToFarLine(), loopToUnloopLine()]} 
          index={index()}
          fieldWord={fieldLine()}
        />
      </div>
      <div class="sequences">
        <SequenceRenderer
          sequence={earlyToLateSequence}
          activeIndex={earlyToLateIndex}
          activeElementCallback={sequenceChangeCallback}
        />
        <SequenceRenderer
          sequence={nearToFarSequence}
          activeIndex={nearToFarIndex}
          activeElementCallback={sequenceChangeCallback}
        />
        <SequenceRenderer
          sequence={loopToUnloopSequence}
          activeIndex={loopToUnloopIndex}
          activeElementCallback={sequenceChangeCallback}
        />
      </div>
    </main>
  );
}
