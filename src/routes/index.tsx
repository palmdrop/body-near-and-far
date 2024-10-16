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
import { randomInteger } from "~/utils/random";
import { getMaxIndex, sequenceChangeCallback } from "~/utils/sequence";
import { indicesFromURL, indicesToUrlHash } from "~/utils/url";

const sequenceSpeed = 8500;
const fieldSpeed = sequenceSpeed / 2;
const linkProbability = 0.75;

const showCanvas = true;

const compositeFadeInTimeout = 2000;

export default function Root() {
  let canvas: HTMLCanvasElement;
  let main: HTMLElement;

  let activeElements: (HTMLLIElement | undefined)[] = [undefined, undefined, undefined];

  const startIndices = indicesFromURL(
    [
      ...sequences.map(sequence => randomInteger(getMaxIndex(sequence))),
      randomInteger(bodyField.length)
    ] as [number, number, number, number]
  );

  const [searchParams, setSearchParams] = useSearchParams();

  const [isRunning, setIsRunning] = createSignal(true);
  const [visible, setVisible] = createSignal(false);
  const [showComposite, setShowComposite] = createSignal(true);

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

  const canvasLoop = showCanvas ? createLoops([
    // Canvas render loop
    {
      callback: () => {
        canvasRenderer?.draw(activeElements as HTMLLIElement[]);
      },
      rate: sequenceSpeed,
      constant: true
    }
  ]) : undefined;

  const { 
    start, 
    stop 
  } = createLoops([
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
          canvasRenderer?.setLinks(links)
        } else {
          canvasRenderer?.clearLinks();
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
  ]);

  onMount(() => {
    const isRunning = searchParams["running"] !== "false"
    setIsRunning(isRunning);
    setVisible(true);

    if(showCanvas) {
      canvasRenderer = createCanvas(canvas);
      canvasRenderer.resize(main);
    }

    if(isRunning) start();
    canvasLoop?.start();

    const keyboardListener = (event: KeyboardEvent) => {
      event.preventDefault();
      switch(event.key) {
        case " ": {
          toggle();
        } break;
      }
      return;
    }

    const onResize = () => {
      canvasRenderer.resize(main);
    }

    let interactionTimeout: NodeJS.Timeout | undefined = undefined;
    
    const onInteract = () => {
      if(interactionTimeout) {
        clearTimeout(interactionTimeout);
      }

      setShowComposite(false);
      interactionTimeout = setTimeout(() => {
        setShowComposite(true);
        interactionTimeout = undefined;
      }, compositeFadeInTimeout);
    }

    window.addEventListener("keydown", keyboardListener);
    window.addEventListener("resize", onResize);

    main.addEventListener("wheel", onInteract);
    main.addEventListener("touchmove", onInteract);

    onCleanup(() => {
      window.removeEventListener("keydown", keyboardListener);
      window.removeEventListener("resize", onResize);

      main.removeEventListener("wheel", onInteract);
      main.removeEventListener("touchmove", onInteract);

      stop();
      canvasLoop?.start();

      clearTimeout(interactionTimeout);
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
    () => linkedSequenceIterator.lineIndices.map(index => index())
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
      <Title>
        {`${fieldIterator.word()?.toUpperCase()} | ${APP_TITLE}`}
      </Title> 
      <main ref={element => main = element}>
        { showCanvas && <canvas 
          id="body-link-canvas"
          ref={element => canvas = element}
        />}
        <div class="center-piece" classList={{ visible: showComposite() }}>
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
              activeElementCallback={(element, root) => {
                activeElements[i] = element;
                sequenceChangeCallback(element, root);
              }}
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
