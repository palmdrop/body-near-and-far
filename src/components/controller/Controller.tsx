import { Show } from "solid-js";

type Props = {
  running: boolean,
  onToggleRunning: () => void,
  delta: number,
}

export default function Controller (
  props: Props 
) { 

  return (
    <div class="controller">
      <button
        onClick={props.onToggleRunning}
      >
        <Show
          when={props.running}
          fallback={<span>Start</span>}
        >
          <span>Stop</span>  
        </Show>
      </button>
      <div
        class="progress"
        style={`--value: ${props.delta}`}
      >
        <div class="bar"></div>
      </div>
    </div>
  );
}