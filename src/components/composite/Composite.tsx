import { Component, For } from "solid-js";
import { LineRenderer } from "../line/LineRenderer";

type Props = {
  lines: string[],
  fieldWord: string,
  index: string
}

export const Composite: Component<Props> = (props) => {
  return (
    <article class="composite filtered">
      <For each={props.lines}>
        {line => (
          <p>
            <LineRenderer line={line} />
          </p>
        )}
      </For>
      <p class="field">
        <LineRenderer line={props.fieldWord} />
      </p>
      <p class="index">
        { props.index }
      </p>
    </article>
  );
}