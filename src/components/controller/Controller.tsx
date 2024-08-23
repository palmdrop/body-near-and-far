import { createEffect, createSignal, mergeProps, onCleanup, Show } from "solid-js";

type Props = {
  running: boolean,
  onToggleRunning: () => void,
  delta: number,
  index: string,
  deltaEdgeThreshold?: number,
  edgeClassFadeout?: number
}


export default function Controller (
  inputProps: Props 
) { 
  const props = mergeProps(
    { deltaEdgeThreshold: 0.001, edgeClassFadeout: 300 }, 
    inputProps
  );

  const [startActive, setStartActive] = createSignal(false);
  const [endActive, setEndActive] = createSignal(false);

  createEffect(() => {
    if(props.delta < props.deltaEdgeThreshold && !startActive()) {
      setStartActive(true);
    }

    if(props.delta > (1 - props.deltaEdgeThreshold) && !endActive()) {
      setEndActive(true);
    }
  });

  createEffect(() => {
    if(!startActive()) return;

    const timeout = setTimeout(() => {
      setStartActive(false);
    }, props.edgeClassFadeout);

    onCleanup(() => {
      clearTimeout(timeout);
    })
  });

  createEffect(() => {
    if(!endActive()) return;

    const timeout = setTimeout(() => {
      setEndActive(false);
    }, props.edgeClassFadeout);

    onCleanup(() => {
      clearTimeout(timeout);
    })
  });

  return (
    <div 
      class="controller" 
      style={`--edge-class-fadeout: ${props.edgeClassFadeout}ms;`}
    >
      <div class="progress-wrapper">
        <button
          onClick={props.onToggleRunning}
        >
          <Show
            when={props.running}
            fallback={<span>▶</span>}
          >
            <span>❚❚</span>  
          </Show>
        </button>
        <span
          classList={{
            progress: true,
            start: startActive(),
            end: endActive()
          }}
          style={`--value: ${props.delta}`}
        >
          <span class="bar"></span>
        </span>
      </div>
      <span class="index">{props.index}</span>
    </div>
  );
}