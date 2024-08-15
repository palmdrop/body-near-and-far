import { Title } from "@solidjs/meta";
import { createEffect, createMemo, createSignal, onCleanup, onMount, Show } from "solid-js";
import { Filter } from "~/assets/MorphFilter";
import { Composite } from "~/components/composite/Composite";
import { SequenceRenderer } from "~/components/sequence/SequenceRenderer";
import { createLinkedIterator } from "~/core";
import { bodyField } from "~/data/field/body";
import { sequenceLinks, sequences } from "~/data/sequence";
import { createFieldIterator } from "~/utils/field";
import { sequenceChangeCallback } from "~/utils/sequence";
import { indicesFromURL, indicesToUrlHash } from "~/utils/url";


// TODO: make slower
const sequenceSpeed = 5000;
const fieldSpeed = 2000;
const linkProbability = 0.5;

export default function Root() {
  const startIndices = indicesFromURL();
  const [isRunning, setIsRunning] = createSignal(true);

  const {
    update: updateLinkedIterator,
    lineIndices: sequenceIndices,
    lines: sequenceLines
  } = createLinkedIterator(sequences, sequenceLinks, {
    linkProbability,
    startIndices
  });

  const fieldIterator = createFieldIterator(
    bodyField, 
    startIndices[sequences.length], 
    fieldSpeed, 
    fieldSpeed / 2
  );

  createEffect(() => {
    fieldIterator.setIsRunning(isRunning());
    if(!isRunning()) return;

    const interval = setInterval(() => {
      updateLinkedIterator();
    }, sequenceSpeed);

    onCleanup(() => {
      clearInterval(interval);
    });
  });

  const indices = createMemo(
    () => sequenceIndices.map(i => i())
  );

  const fieldLine = createMemo(
    () => fieldIterator.inSubField() ? 
      `[ ${fieldIterator.word()} ]` 
      : fieldIterator.word()
  );

  const index = createMemo(
    () => indicesToUrlHash(fieldIterator.index(), ...indices())
  );

  createEffect(() => {
    const hash = indicesToUrlHash(
      fieldIterator.index(), 
      ...indices()
    );

    window.location.hash = hash;
  });

  return (
    <div class="root">
      <Filter />
      <main>
        <Title>{`${fieldIterator.word()?.toUpperCase()} | Nära och långt från kroppen`}</Title> 
        <div class="center-piece">
          <Composite 
            lines={sequenceLines()} 
            index={index()}
            fieldWord={fieldLine()}
          />
        </div>
        <div class="sequences">
          { sequences.map((sequence, i) => (
            <SequenceRenderer
              sequence={sequence}
              activeIndex={sequenceIndices[i]}
              activeElementCallback={sequenceChangeCallback}
            />
          )) }
        </div>
      </main>
      <aside>
        <button
          onClick={() => setIsRunning(isRunning => !isRunning)}
        >
          <Show
            when={isRunning()}
            fallback={<span>Start</span>}
          >
            <span>Stop</span>  
          </Show>
        </button>
      </aside>
    </div>
  );
}
