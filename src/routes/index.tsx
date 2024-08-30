import { Title } from "@solidjs/meta";
import { useSearchParams } from "@solidjs/router";
import { createEffect, createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { Filter } from "~/assets/MorphFilter";
import { Composite } from "~/components/composite/Composite";
import Controller from "~/components/controller/Controller";
import { SequenceRenderer } from "~/components/sequence/SequenceRenderer";
import { APP_TITLE } from "~/constant";
import { createLinkedIterator } from "~/core";
import { createCanvas } from "~/core/canvas";
import { bodyField } from "~/data/field/body";
import { sequenceLinks, sequences } from "~/data/sequence";
import { easeInOutQuart } from "~/utils/easing";
import { createFieldIterator } from "~/utils/field";
import { createLoops } from "~/utils/loop";
import { getMaxIndex, sequenceChangeCallback } from "~/utils/sequence";
import { indicesFromURL, indicesToUrlHash } from "~/utils/url";

const sequenceSpeed = 6000;
const fieldSpeed = sequenceSpeed / 2;
const linkProbability = 0.5;

const randomInteger = (max: number) => Math.floor(Math.random() * max);

export default function Root() {
  let canvas: HTMLCanvasElement;
  let main: HTMLElement;

  const startIndices = indicesFromURL(
    [
      ...sequences.map(sequence => randomInteger(getMaxIndex(sequence))),
      randomInteger(bodyField.length)
    ] as [number, number, number, number]
  );

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

  let canvasRenderer: ReturnType<typeof createCanvas>;

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
        callback: () => {
          fieldIterator.update();
          const links = linkedSequenceIterator.update();

          if(links?.length) {
            console.log(links);
          }
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

    canvasRenderer = createCanvas(canvas);

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
      <Title>{`${fieldIterator.word()?.toUpperCase()} | ${APP_TITLE}`}</Title> 
      <main ref={element => main = element}>
        <canvas 
          id="body-link-canvas"
          ref={element => canvas = element}
        />
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
