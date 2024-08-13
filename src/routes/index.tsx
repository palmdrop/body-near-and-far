import { Title } from "@solidjs/meta";
import { createEffect, createMemo } from "solid-js";
import { Filter } from "~/assets/MorphFilter";
import { Composite } from "~/components/composite/Composite";
import { SequenceRenderer } from "~/components/sequence/SequenceRenderer";
import { bodyField } from "~/data/field/body";
import { sequences } from "~/data/sequence";
import { createFieldIterator } from "~/utils/field";
import { createSequenceIterator, sequenceChangeCallback } from "~/utils/sequence";
import { indicesFromURL, indicesToUrlHash } from "~/utils/url";


// TODO: make slower
const sequenceSpeed = 2000;
const fieldSpeed = 1000;

export default function Root() {
  const startIndices = indicesFromURL();

  const sequenceIterators = sequences.map(
    (sequence, i) => createSequenceIterator(sequence, sequenceSpeed, startIndices[i])
  );

  const sequenceIndices = createMemo(
    () => sequenceIterators.map(iterator => iterator.index())
  );

  const sequenceLines = createMemo(
    () => sequenceIterators.map(iterator => iterator.line())
  );

  const fieldIterator = createFieldIterator(
    bodyField, 
    startIndices[sequences.length], 
    fieldSpeed, 
    fieldSpeed / 2
  );

  const fieldLine = createMemo(
    () => fieldIterator.inSubField() ? 
      `[ ${fieldIterator.word()} ]` 
      : fieldIterator.word()
  );

  const index = createMemo(
    () => indicesToUrlHash(fieldIterator.index(), ...sequenceIndices())
  );



  createEffect(() => {
    const hash = indicesToUrlHash(
      fieldIterator.index(), 
      ...sequenceIndices()
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
              activeIndex={sequenceIterators[i].index}
              activeElementCallback={sequenceChangeCallback}
            />
          )) }
        </div>
      </main>
    </div>
  );
}
