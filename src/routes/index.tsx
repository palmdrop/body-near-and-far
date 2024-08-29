import { Title } from "@solidjs/meta";
import { useSearchParams } from "@solidjs/router";
import { createEffect, createMemo, createSignal, onCleanup, onMount, Show } from "solid-js";
import { Filter } from "~/assets/MorphFilter";
import { Composite } from "~/components/composite/Composite";
import Controller from "~/components/controller/Controller";
import { SequenceRenderer } from "~/components/sequence/SequenceRenderer";
import { createLinkedIterator } from "~/core";
import { bodyField } from "~/data/field/body";
import { sequenceLinks, sequences } from "~/data/sequence";
import { easeInOutQuart } from "~/utils/easing";
import { createFieldIterator } from "~/utils/field";
import { createLoops } from "~/utils/loop";
import { sequenceChangeCallback } from "~/utils/sequence";
import { indicesFromURL, indicesToUrlHash } from "~/utils/url";

const sequenceSpeed = 6000;
const fieldSpeed = sequenceSpeed / 2;
const linkProbability = 0.5;

export default function Root() {
  const startIndices = indicesFromURL();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isRunning, setIsRunning] = createSignal(true);
  const [visible, setVisible] = createSignal(false);

  const linkedSequenceIterator = createLinkedIterator(
    sequences, 
    sequenceLinks, 
    {
      linkProbability,
      startIndices
    }
  );

  const fieldIterator = createFieldIterator(
    bodyField, 
    startIndices[sequences.length], 
  );

  const [delta, setDelta] = createSignal(0);

  const { start, stop } = createLoops(
    [
      // Delta loop
      {
        callback: delta => {
          setDelta(
            Math.min(Math.max(easeInOutQuart(delta / sequenceSpeed), 0), 1)
          );
        },
        rate: sequenceSpeed,
        constant: true
      },
      // Linked sequence loop
      {
        callback: delta => {
          linkedSequenceIterator.update();
          fieldIterator.update();
        },
        rate: sequenceSpeed
      },
      // Main field loop
      {
        callback: () => {
          if(fieldIterator.inSubField()) return;
          fieldIterator.update();
        },
        rate: fieldSpeed
      },
      // Sub field loop
      {
        callback: () => {
          if(!fieldIterator.inSubField()) return;
          fieldIterator.update();
        },
        rate: fieldSpeed / 2
      }
    ]
  );

  onMount(() => {
    const isRunning = searchParams["running"] !== "false"
    setIsRunning(isRunning);
    setVisible(true);

    if(isRunning) start();

    const keyboardListener = (event: KeyboardEvent) => {
      event.preventDefault();
      switch(event.key) {
        case " ": {
          toggle();
        } break;
      }
      return;
    }

    window.addEventListener("keydown", keyboardListener);

    onCleanup(() => {
      window.removeEventListener("keydown", keyboardListener);
      stop();
    });
  });

  const toggle = () => {
    const running = isRunning();
    setIsRunning(!running);
    setSearchParams({ running: String(!running) });
    if(!running) {
      start(0);
    } else {
      stop();
      setDelta(1);
    }
  }

  const indices = createMemo(
    () => linkedSequenceIterator.lineIndices.map(i => i())
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
    <div 
      classList={{
        root: true,
        visible: visible()
      }}
    >
      <Filter />
      <main>
        <Title>{`${fieldIterator.word()?.toUpperCase()} | Nära och långt från kroppen`}</Title> 
        <div class="center-piece">
          <Composite 
            lines={linkedSequenceIterator.lines()} 
            index={index()}
            fieldWord={fieldLine()}
          />
        </div>
        <div class="sequences">
          { sequences.map((sequence, i) => (
            <SequenceRenderer
              sequence={sequence}
              activeIndex={linkedSequenceIterator.lineIndices[i]}
              activeElementCallback={sequenceChangeCallback}
            />
          )) }
        </div>
      </main>
      <aside>
        <Controller
          running={isRunning()}
          onToggleRunning={toggle}
          delta={delta()}
          index={index()}
        />
      </aside>
    </div>
  );
}
